import React, { useEffect, useState } from "react";
import useAxiosFetch from "../../../hooks/useAxiosFetch";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const PopularInstructor = () => {
  const [instructors, setInstructors] = useState([]);
  const axiosFetch = useAxiosFetch();

  useEffect(() => {
    axiosFetch
      .get("/popular-instructors")
      .then((data) => {
        setInstructors(data.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // Generate a unique avatar URL based on the instructor's name
  const getUniqueAvatarUrl = (identifier) =>
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(identifier)}`;

  // Fallback for name if missing
  const getInstructorName = (instructor) => {
    return instructor?.instructor?.name || null;
  };

  // Filter out instructors without a name
  const filteredInstructors = instructors.filter(
    (instructor) => getInstructorName(instructor) !== null
  );

  return (
    <div className="my-28">
      <div className="mb-20">
        <h1 className="text-5xl font-bold text-center text-secondary">
          Our <span className="text-black dark:text-white">Amazing</span> Teachers
        </h1>
        <div className="w-[40%] text-center mx-auto my-4">
          <p className="text-gray-500">
            Explore our Popular Classes. Here are some popular classes based on how many students enrolled.
          </p>
        </div>
      </div>

      {filteredInstructors.length > 0 ? (
        <div className="grid mb-28 md:grid-cols-2 lg:grid-cols-4 mx-auto w-[90%] gap-6">
          {filteredInstructors.map((instructor, i) => (
            <div
              key={i}
              className="flex dark:text-white hover:-translate-y-2 duration-200 cursor-pointer flex-col shadow-md py-8 px-10 md:px-8 rounded-md"
            >
              <div className="flex flex-col gap-6 md:gap-8">
                <img
                  className="rounded-full border-4 border-gray-300 h-24 w-24 mx-auto"
                  src={instructor?.instructor?.photoUrl || getUniqueAvatarUrl(getInstructorName(instructor))}
                  alt="Instructor Avatar"
                />
                <div className="flex flex-col text-center">
                  <div className="font-medium text-lg dark:text-white text-gray-800">
                    {getInstructorName(instructor)}
                  </div>
                  <div className="text-gray-500 whitespace-nowrap">Instructor</div>
                  <div className="text-gray-500 mb-4 whitespace-nowrap">
                    Total Students: {instructor?.totalEnrolled}
                  </div>
                  <div className="flex flex-row items-center justify-center gap-4 text-gray-800 my-auto text-2xl mx-auto md:mx-0">
                    <a className="hover:cursor-pointer text-secondary duration-300">
                      <FaLinkedin />
                    </a>
                    <a className="hover:cursor-pointer text-secondary duration-300">
                      <FaFacebook />
                    </a>
                    <a className="hover:cursor-pointer text-secondary duration-300">
                      <FaInstagram />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No Instructor Available</p>
      )}
    </div>
  );
};

export default PopularInstructor;
