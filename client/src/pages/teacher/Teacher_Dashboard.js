import React, { useState, useRef, useEffect } from "react";
import Teacher_Sidebar from "../../components/teacher/Teacher_Sidebar";
import TeacherTestCard from "../../components/teacher/Teacher_TestCard";
import TeacherPastTestCard from "../../components/teacher/Teacher_PastTestCard";
import Details from "../../components/NavbarDetails";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setExam, clearExamId } from "../../redux/ExamSlice";
import { clearUser, setSubmitTestUser } from "../../redux/userSlice";
import { clearQuestions } from "../../redux/questionSlice";
import Loader from "../../components/Loader";

function Teacher_Dashboard() {
  const userData = useSelector((state) => state.user.user);
  let examId = useSelector((state) => state.exam.examId);

  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState("live");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to track errors
  const detailsRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // console.log(userData);

  // Helper function to format date to readable format
  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  const fetchTestsMadeForTeachers = async (status) => {
    setLoading(true);
    // console.log(status)
    let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    let url = `${API_BASE_URL}/api/exams/teacher`; // Default for "All"
    // console.log(status)
    if (typeof status !== "string" || status.trim() === "") {
      throw new Error("Status Invalid");
    }

    try {
      const response = await axios.get(url, {
        params: {
          status,
        },
        withCredentials: true, // Make sure the cookie is sent with the request
      });
      setLoading(false);
      // console.log('response is ', response.data);
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      // const pastPaper = await axios.get(`${API_BASE_URL}/api/exams/teacher-results/${userData.id}`, {
      //   withCredentials: true,  // Make sure the cookie is sent with the request
      // })

      dispatch(setExam(response.data.exams));
      // console.log('past tests is ', pastPaper);
      // setResult(pastPaper.data.results)
      // console.log(result)
      // console.log('responseExamId.data',responseExamId.data);
      // dispatch(markSubmit(responseExamId.data))
      // const fetchedTests = response.data.exams || []
      // setTests((prevTests) => JSON.stringify(prevTests) !== JSON.stringify(fetchedTests) ? fetchedTests : prevTests);
      setTests(response.data.exams || []);
    } catch (err) {
      console.error("error getting response ", err);
    }
  };

  const responseExamId = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

      const response = await axios.get(
        `${API_BASE_URL}/api/exams/teacher-responses/user_id?status=submitted`,
        { withCredentials: true },
      );
      // console.log(response.data)
      dispatch(setSubmitTestUser(response.data));
    } catch (error) {
      console.error("Error fetching teacher responses:", error);
      setError("Error fetching teacher responses");
    }
  };

  useEffect(() => {
    if (userData?.id) {
      // Only call API if user_id is defined
      responseExamId();
    }
  }, [userData.id, loading]);

  useEffect(() => {
    // Close the sidebar if clicked outside
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    // Attach event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchTestsMadeForTeachers(filter);
  }, [filter]);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

  useEffect(() => {
    // Close the Details component when clicking outside
    function handleClickOutside(event) {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        closeDetails();
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOnline = async () => {
    try {
      alert("You are online!");
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/api/users/logout`, {
        withCredentials: true, // Make sure the cookie is sent with the request
      });
      dispatch(clearUser());
      dispatch(clearExamId(examId));
      dispatch(clearQuestions());

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error handling online event:", error); // Log any potential errors
    }
  };

  useEffect(() => {
    // Add the 'online' event listener when the component mounts
    window.addEventListener("online", handleOnline);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value); // Update filter
  };

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const firstInitial = nameParts[0]?.charAt(0) || "";
    const lastInitial =
      nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className={`flex h-screen`}>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } transition-transform duration-300 w-64 xl:block`}
      >
        <Teacher_Sidebar />
      </div>

      {/* Loader while fetching data */}
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center mt-8">{error}</p>
      ) : (
        <>
          {/* Main Section */}
          <div
            id="main-section"
            className={` bg-white h-max w-full overflow-hidden transition-all duration-300 xl:ml-64`}
          >
            {/* Top Bar */}
            <div className="bg-gray-100 h-14 border-b border-gray-200 flex items-center">
              {/* Burger Icon Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="xl:hidden text-gray-800 focus:outline-none"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={
                      sidebarOpen
                        ? "M6 18L18 6M6 6l12 12" // Cross icon for "close"
                        : "M4 6h16M4 12h16M4 18h16" // Burger icon for "open"
                    }
                  />
                </svg>
              </button>
              <h1 className="text-xl font-medium text-gray-800 ml-5 sm:ml-60 xl:ml-5">
                Dashboard
              </h1>
              <div
                className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
                onClick={openDetails}
              >
                {getInitials(userData.name)}
              </div>
              <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
            </div>

            {/* Main Content */}
            <div className="px-4">
              <h1 className="text-blue-700 text-2xl mt-4 font-medium">
                Welcome to Atharva college Aptitude Portal
              </h1>

              {/* Filters Section */}
              <div className="flex border-b border-gray-200 pb-3 items-center mt-5">
                <select
                  className="bg-white px-3 py-1 focus:outline-none font-medium text-black hover:cursor-pointer"
                  value={filter}
                  onChange={handleFilterChange}
                >
                  <option value="scheduled">Upcoming</option>
                  <option value="live">Live</option>
                </select>
              </div>

              {/* Test Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-5">
                {tests.length > 0 ? (
                  tests.map((test, index) => (
                    <TeacherTestCard
                      key={test.exam_id || index}
                      examId={test.exam_id}
                      testName={test.exam_name}
                      duration={test.duration}
                      status={test.status}
                      questionCount={test.total_questions}
                      lastDate={formatToReadableDate(test.created_at)}
                    />
                  ))
                ) : (
                  <p>No exams available.</p>
                )}
              </div>

              {/* Analytics Section
          <div className="mt-5">
            <h1 className="font-semibold text-black text-lg">Analytics</h1>
            <div className="flex overflow-x-auto space-x-4 mt-3" style={{ scrollbarWidth: "none" }}>
              {result.map((test, index) => (
                <div className="flex-shrink-0 ">
                  <TeacherPastTestCard
                    key={index}
                    testName={test.exam_name}
                    submittedOn={test.Date}
                    time={test.duration}
                    total_score={test.total_score}
                    max_score={test.max_score}
                    status={test.status}
                  />
                </div>
              ))}
            </div>
          </div> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Teacher_Dashboard;
