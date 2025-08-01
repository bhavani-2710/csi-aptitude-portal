import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import Sidebar from "../../components/teacher/mcqexampage/Sidebar";
import {
  setSelectedOption,
  visitQuestion,
  clearQuestions,
  toggleMarkForReview,
  setMultipleSelectedOption,
  setTextAnswer,
  clearAnswer,
} from "../../redux/questionSlice";
import { clearExamId } from "../../redux/ExamSlice";
import NoCopyComponent from "../../components/teacher/mcqexampage/NoCopyComponent";
import Question from "../../components/teacher/mcqexampage/Question";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./TeacherMCQExamPage.css";

const Teacher_MCQExamPage = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const exam = useSelector((state) => state.exam.exam);
  const location = useLocation();
  const Duration = location.state?.Duration;
  const examId = location.state?.examId;
  const userId = useSelector((state) => state.user.user.id);
  const userName = useSelector((state) => state.user.user.name);
  const userEmail = useSelector((state) => state.user.user.email);
  const { questions, currentQuestionIndex } = useSelector((state) => state.questions);

  const [fullscreenError, setFullscreenError] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timeUp, setTimeUp] = useState(false);

  // Local state to handle multiple options and text answers
  const [multipleAnswers, setMultipleAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});

  const formatTimeFromSeconds = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    window.history.pushState(null, document.title, window.location.href);

    const handleBackButton = (e) => {
      e.preventDefault();
      navigate('/teacher');
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);

  const enableFullscreen = () => {
    const rootElement = document.documentElement;
    if (rootElement.requestFullscreen) {
      rootElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      console.warn("Fullscreen API is not supported in this browser.");
    }
  };

  const submitFinalResponse = async () => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/teacher-responses/final/${examId}`;
    await axios.put(url, {}, { withCredentials: true });
  };

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !currentQuestion.visited) {
      dispatch(visitQuestion(currentQuestionIndex));
    }
  }, [dispatch, questions, currentQuestionIndex]);

  useEffect(() => {
    const socketConnect = async () => {
      if (!socketRef.current) {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        socketRef.current = io(`${API_BASE_URL}/exams/start-exam`, {
          withCredentials: true,
        });
      }

      const socket = socketRef.current;
      socket.emit("start_exam", {
        exam_id: examId,
        duration: Duration * 60,
      });

      socket.on("timer_update", (data) => setRemainingTime(data.remainingTime));
      socket.on("exam_ended", () => {
        submitFinalResponse();
        setTimeUp(true);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off("connect");
          socketRef.current.off("timer_update");
          socketRef.current.off("exam_ended");
          socketRef.current.disconnect();
        }
      };
    };
    socketConnect();
  }, []);

  useEffect(() => {
    if (timeUp) handleSubmitTest();
  }, [timeUp]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !testSubmitted) {
        setFullscreenError(true);
      }
    };

    if (!testSubmitted) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testSubmitted]);

  const handleOptionSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    dispatch(setSelectedOption({ index: currentQuestionIndex, option }));
  };

  const handleMultipleOptionsSelect = (options) => {
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion?.question_id;

    setMultipleAnswers({
      ...multipleAnswers,
      [questionId]: options,
    });
    dispatch(setMultipleSelectedOption({ index: currentQuestionIndex, options }));
  };

  const handleTextChange = (text) => {
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion?.question_id;

    setTextAnswers({
      ...textAnswers,
      [questionId]: text,
    });
    dispatch(setTextAnswer({ index: currentQuestionIndex, text }));
  };

  const singleResponse = async (option, id, question_type) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/teacher-responses/${examId}`;
    const payload = {
      question_id: id,
      selected_option: option,
      selected_options: null,
      text_answer: null,
      question_type,
    };
    await axios.put(url, payload, { withCredentials: true });
  };

  const multipleResponse = async (options, id, question_type) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/teacher-responses/${examId}`;
    const payload = {
      question_id: id,
      selected_option: null,
      selected_options: options,
      text_answer: null,
      question_type,
    };
    await axios.put(url, payload, { withCredentials: true });
  };

  const textResponse = async (text, id, question_type) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/teacher-responses/${examId}`;
    const payload = {
      question_id: id,
      selected_option: null,
      selected_options: null,
      text_answer: text,
      question_type,
    };
    await axios.put(url, payload, { withCredentials: true });
  };

  const handleOffline = () => {
    alert("You are offline. Some features may not be available.");
    navigate("/teacher", { replace: true });
  };

  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(visitQuestion(currentQuestionIndex + 1));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(visitQuestion(currentQuestionIndex - 1));
    }
  };

  const handleSubmitTest = async () => {
    setTestSubmitted(true);
    await submitFinalResponse();
    socketRef.current.emit("submit_responses");
    dispatch(clearExamId(examId));
    dispatch(clearQuestions());
    alert("Test submitted successfully!");
    navigate("/teacher", { replace: true });
  };

  const handleClearAnswer = async (id) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/teacher-responses/exams/clear-response`;

    try {
      const currentQuestion = questions[currentQuestionIndex];

      if (currentQuestion?.question_type === "single_choice") {
        dispatch(setSelectedOption({ index: currentQuestionIndex, option: null }));
      } else if (currentQuestion?.question_type === "multiple_choice") {
        setMultipleAnswers({
          ...multipleAnswers,
          [id]: [],
        });
        dispatch(setMultipleSelectedOption({ index: currentQuestionIndex, options: [] }));
      } else if (currentQuestion?.question_type === "text") {
        setTextAnswers({
          ...textAnswers,
          [id]: "",
        });
        dispatch(setTextAnswer({ index: currentQuestionIndex, text: "" }));
      }
      await axios.put(
        url,
        { teacherId: userId, examId: Number(examId), questionId: id },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error clearing response:", error);
    } 
  };

  const handleMarkForReview = () => {
    dispatch(toggleMarkForReview(currentQuestionIndex));
  };

  const handleQuestion = async (question, index) => {
    if (question.question_type === 'text') {
      textResponse(question.textAnswer, question.question_id, question.question_type)
    }
    else if (question.question_type === 'single_choice') {
      singleResponse(question.selectedOption, question?.question_id, question?.question_type);
    }
    else if (question.question_type === 'multiple_choice') {
      multipleResponse(question.selectedOptions, question.question_id, question?.question_type);
    }
    else {
      console.log("no text")
    }
  }

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex] || null;
  };

  const currentQuestion = getCurrentQuestion();
  const questionId = currentQuestion?.question_id;

  const getSelectedOptions = () => {
    if (currentQuestion?.question_type === "multiple_choice") {
      return multipleAnswers[questionId] || [];
    } else {
      return currentQuestion?.selectedOption ? [currentQuestion.selectedOption] : [];
    }
  };

  const getTextAnswer = () => {
    return textAnswers[questionId] || "";
  };
    const handleClearResponse = () => {
      dispatch(clearAnswer(currentQuestionIndex));
    };
  

  return (
    <div className="relative flex-1">
      <div className="flex h-screen bg-[#F5F6F8]">
        <NoCopyComponent onPermissionGranted={enableFullscreen} />
        {fullscreenError && !testSubmitted && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
              <h2 className="text-lg font-semibold mb-4 text-red-500">Fullscreen Mode Required</h2>
              <p className="text-sm text-gray-600 mb-6">
                You have exited fullscreen mode. Please return to fullscreen to continue the exam.
              </p>
              <button
                onClick={() => {
                  setFullscreenError(false);
                  enableFullscreen();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Re-enter Fullscreen
              </button>
            </div>
          </div>
        )}

        <div className="w-9/12 2xl:w-11/12 h-screen px-8 py-6 bg-[#F5F6F8]">  
          {exam
            ?.filter((examItem) => examItem.exam_id === Number(examId))
            .map((examItem) => (
              <h1 key={examItem.exam_id} className="text-xl font-bold text-gray-800 mb-4">
                {examItem.exam_name}
              </h1>
            ))}

          <div className="relative bg-white p-6 rounded-xl shadow-lg h-5/6 mt-8 overflow-hidden">
            <div className="watermark-overlay">
              {Array.from({ length: 300 }).map((_, index) => (
                <div key={index} className="watermark-text">
                  {userEmail}
                </div>
              ))}
            </div>

            <div className="flex justify-end mb-4">
              <span className="font-sans text-center text-sm flex items-center border-2 p-1 border-blue-500 rounded-md">
                {formatTimeFromSeconds(remainingTime)}
              </span>
            </div>

            {currentQuestion && (
              <Question
                questionNumber={currentQuestionIndex + 1}
                question={currentQuestion.question_text || "Loading..."}
                questionType={currentQuestion.question_type || "single_choice"}
                options={currentQuestion.options || {}}
                selectedOption={currentQuestion.selectedOption} 
                selectedOptions={Array.isArray(currentQuestion.selectedOptions) 
                  ? currentQuestion.selectedOptions 
                  : (currentQuestion.selectedOptions ? Object.values(currentQuestion.selectedOptions) : [])}
                textAnswer={currentQuestion.textAnswer || ""}
                imageUrl={currentQuestion.image_url}
                onSelectOption={handleOptionSelect}
                onSelectMultipleOptions={handleMultipleOptionsSelect}
                onTextChange={handleTextChange}
              />
            )}

            <div className="absolute bottom-5 w-full flex justify-between px-8">
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-[#939191] text-white rounded-lg 
                             hover:bg-[#7a7878] transition-colors duration-200 ease-in-out 
                             disabled:bg-gray-300 disabled:hover:bg-gray-300"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePreviousQuestion}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 bg-[#D0150ACC] text-white rounded-lg 
                             hover:bg-[#A00E06CC] transition-colors duration-200 ease-in-out"
                  onClick={() => handleClearResponse(currentQuestion?.question_id)}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#8A2BE2CC] text-white 
                             hover:bg-[#6A1B9ACC] transition-colors duration-200 ease-in-out"
                  onClick={handleMarkForReview}
                >
                  {currentQuestion?.markedForReview ? "Unmark Review" : "Mark for Review"}
                </button>
              </div>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                           hover:bg-blue-600 transition-colors duration-200 ease-in-out 
                           disabled:bg-gray-300 disabled:hover:bg-gray-300"
                onClick={() => {
                  if (currentQuestionIndex < questions.length - 1) {
                    handleNextQuestion();
                    handleQuestion(currentQuestion, currentQuestionIndex);
                  }
                }}
              >
                {currentQuestionIndex === questions.length - 1 ? "Save" : "Save & Next"}
              </button>
            </div>
          </div>
        </div>
        <Sidebar name={userName} onSubmitTest={handleSubmitTest} />
      </div>
    </div>
  );
};

export default Teacher_MCQExamPage;