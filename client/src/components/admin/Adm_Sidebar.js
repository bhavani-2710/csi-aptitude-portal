import React, { useState } from "react";
import { Link } from "react-router-dom";


const Msidebar = () => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-gray-50 shadow-md p-5 font-sans z-50">
      <h2 className="text-blue-700 text-4xl font-bold mb-12 font-sans">Aptitude</h2>
      <ul className="list-none p-0 m-0">
        <li className="flex items-center p-2 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500 ">
          <span className="mr-2 flex items-center justify-center w-6 h-6 ">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.318 13.5H15.443C14.9293 13.4995 14.4364 13.7027 14.0724 14.065C13.7083 14.4274 13.5029 14.9193 13.501 15.433V19.308C13.5007 19.5631 13.5508 19.8158 13.6483 20.0515C13.7458 20.2872 13.8888 20.5014 14.0692 20.6818C14.2496 20.8622 14.4638 21.0052 14.6995 21.1027C14.9353 21.2002 15.1879 21.2503 15.443 21.25H19.318C19.8315 21.2479 20.3232 21.0423 20.6853 20.6783C21.0475 20.3142 21.2505 19.8215 21.25 19.308V15.433C21.2503 15.1792 21.2005 14.9279 21.1035 14.6933C21.0065 14.4588 20.8642 14.2457 20.6847 14.0663C20.5053 13.8868 20.2922 13.7445 20.0577 13.6475C19.8231 13.5505 19.5718 13.5007 19.318 13.501M8.557 13.5H4.682C4.16859 13.5029 3.67721 13.7089 3.3152 14.073C2.95319 14.437 2.74999 14.9296 2.75 15.443V19.318C2.74974 19.5718 2.79953 19.8231 2.89653 20.0577C2.99353 20.2922 3.13583 20.5053 3.31528 20.6847C3.49474 20.8642 3.70783 21.0065 3.94235 21.1035C4.17687 21.2005 4.42821 21.2503 4.682 21.25H8.557C9.07048 21.2505 9.56324 21.0475 9.92726 20.6853C10.2913 20.3232 10.4969 19.8315 10.499 19.318V15.443C10.4993 15.1879 10.4492 14.9353 10.3517 14.6995C10.2542 14.4638 10.1112 14.2496 9.93079 14.0692C9.75041 13.8888 9.53622 13.7458 9.30048 13.6483C9.06475 13.5508 8.8121 13.5007 8.557 13.501M8.557 2.75H4.682C4.42821 2.74974 4.17687 2.79953 3.94235 2.89653C3.70783 2.99353 3.49474 3.13583 3.31528 3.31528C3.13583 3.49474 2.99353 3.70783 2.89653 3.94235C2.79953 4.17687 2.74974 4.42821 2.75 4.682V8.557C2.74947 9.07048 2.95253 9.56324 3.31468 9.92726C3.67683 10.2913 4.16852 10.4969 4.682 10.499H8.557C8.8121 10.4993 9.06475 10.4492 9.30048 10.3517C9.53622 10.2542 9.75041 10.1112 9.93079 9.93079C10.1112 9.75041 10.2542 9.53622 10.3517 9.30048C10.4492 9.06475 10.4993 8.8121 10.499 8.557V4.682C10.4969 4.16852 10.2913 3.67683 9.92726 3.31468C9.56324 2.95253 9.07048 2.74947 8.557 2.75ZM19.318 2.75H15.443C14.9295 2.74947 14.4368 2.95253 14.0727 3.31468C13.7087 3.67683 13.5031 4.16852 13.501 4.682V8.557C13.5013 9.07197 13.706 9.56577 14.0701 9.92991C14.4342 10.294 14.928 10.4987 15.443 10.499H19.318C19.8315 10.4969 20.3232 10.2913 20.6853 9.92726C21.0475 9.56324 21.2505 9.07048 21.25 8.557V4.682C21.2503 4.42821 21.2005 4.17687 21.1035 3.94235C21.0065 3.70783 20.8642 3.49474 20.6847 3.31528C20.5053 3.13583 20.2922 2.99353 20.0577 2.89653C19.8231 2.79953 19.5718 2.74974 19.318 2.75Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <Link to="/admin">Home</Link>
        </li>

        <li
          className="flex items-center p-2 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500"
          onClick={toggleSubmenu}
        >
          <span className="mr-2 flex items-center justify-center w-6 h-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1003 2.39077C14.8335 1.67227 15.8206 1.27216 16.8471 1.27739C17.8736 1.28263 18.8566 1.69277 19.5824 2.41871C20.3082 3.14464 20.7182 4.12768 20.7232 5.1542C20.7283 6.18071 20.328 7.16774 19.6093 7.90077L12.0153 15.4948C11.5873 15.9228 11.3253 16.1848 11.0353 16.4118C10.6919 16.6793 10.3204 16.9086 9.92734 17.0958C9.59334 17.2548 9.24234 17.3718 8.66834 17.5628L5.99634 18.4538L5.35434 18.6678C5.07269 18.7619 4.7704 18.7756 4.48137 18.7075C4.19234 18.6394 3.92802 18.492 3.71804 18.2821C3.50807 18.0721 3.36075 17.8078 3.29263 17.5187C3.2245 17.2297 3.23825 16.9274 3.33234 16.6458L4.43734 13.3318C4.62834 12.7578 4.74534 12.4068 4.90434 12.0728C5.09185 11.68 5.32153 11.3088 5.58934 10.9658C5.81634 10.6748 6.07734 10.4128 6.50534 9.98577L14.1003 2.39077ZM5.96034 16.8848L5.11634 16.0388L5.84434 13.8538C6.05634 13.2178 6.14434 12.9588 6.25834 12.7188C6.39967 12.4234 6.57067 12.1468 6.77134 11.8888C6.93534 11.6788 7.12734 11.4848 7.60134 11.0098L13.4923 5.11977C13.7984 5.88452 14.2575 6.5787 14.8413 7.15977C15.4225 7.74327 16.1167 8.20197 16.8813 8.50777L10.9903 14.3978C10.5153 14.8728 10.3223 15.0648 10.1123 15.2278C9.85367 15.4291 9.57701 15.6004 9.28234 15.7418C9.04234 15.8558 8.78234 15.9438 8.14634 16.1558L5.96034 16.8848ZM18.0763 7.31177C17.9223 7.27778 17.7703 7.23471 17.6213 7.18277C16.9728 6.95738 16.3845 6.58659 15.9013 6.09877C15.4146 5.61476 15.044 5.02668 14.8173 4.37877C14.7651 4.2298 14.7217 4.07787 14.6873 3.92377L15.1603 3.45177C15.6121 3.0146 16.2176 2.77248 16.8462 2.77764C17.4748 2.78279 18.0763 3.0348 18.5208 3.47933C18.9653 3.92385 19.2173 4.52528 19.2225 5.15391C19.2276 5.78254 18.9855 6.38802 18.5483 6.83977L18.0763 7.31177ZM3.25034 21.9998C3.25034 21.8009 3.32936 21.6101 3.47001 21.4694C3.61066 21.3288 3.80143 21.2498 4.00034 21.2498H20.0003V22.7498H4.00034C3.80143 22.7498 3.61066 22.6708 3.47001 22.5301C3.32936 22.3895 3.25034 22.1987 3.25034 21.9998Z" fill="black" />
            </svg>
          </span>
          All Tests
          <span className={`ml-auto ${showSubmenu ? "rotate-180" : ""}`}>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </li>

        {showSubmenu && (
          <ul className="pl-5 mt-1">
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/drafted-tests">Drafted Tests</Link>
            </li>
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/scheduled-tests">Schedule Tests</Link>
            </li>
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/past-tests"> Past Test</Link>
            </li>
          </ul>
        )}
      </ul>
    </div>
  );
};

export default Msidebar;
