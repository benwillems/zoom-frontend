import React, { useState, useEffect } from "react";
import { HiLightBulb } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const modalVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

const AICourseModal = ({ onClose, appointment }) => {
  const [openCategories, setOpenCategories] = useState({});
  const [loading, setLoading] = useState(false);

  // Get score data directly from the appointment
  const scoreData = appointment?.talkingPointScore || null;
  const totalScore = appointment?.totalScore || 0;
  const obtainedScore = appointment?.obtainedScore || 0;

  // Initialize with all categories open
  useEffect(() => {
    if (scoreData?.points?.length > 0) {
      const initialOpenState = {};
      scoreData.points.forEach((point) => {
        initialOpenState[point.name] = true;
      });
      setOpenCategories(initialOpenState);
    }
  }, [scoreData]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        className="relative bg-white p-6 rounded-3xl shadow-2xl w-[65%] mx-4 overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="sticky -top-6 bg-white pb-4 z-10">
          <button
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 text-red-500 border-[3px] border-red-500 rounded-full"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Talking Points Score
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-center text-lg font-bold flex items-center justify-center">
            <HiLightBulb className="text-xl mr-1 text-yellow-500" />
            Overall Score: {obtainedScore} / {totalScore}
          </p>
        </div>

        <div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {scoreData?.points?.length > 0 ? (
                <div className="flex flex-col space-y-6">
                  {scoreData.points.map((point, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="bg-white border border-gray-300 rounded-xl shadow-md transition-all duration-300"
                    >
                      {/* Accordion Header */}
                      <div
                        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCategory(point.name)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">💡</span>
                          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-900 bg-clip-text text-transparent">
                            {point.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center">
                            <HiLightBulb className="text-lg mr-1 text-yellow-500" />
                            Score: {point.score.scored}/{point.score.total}
                          </span>
                          {openCategories[point.name] ? (
                            <MdExpandLess className="text-2xl text-gray-600" />
                          ) : (
                            <MdExpandMore className="text-2xl text-gray-600" />
                          )}
                        </div>
                      </div>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {openCategories[point.name] && (
                          <motion.div
                            layout
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 border-t border-gray-200">
                              {point.pointMissed && point.pointMissed !== "None" && (
                                <div className="flex flex-col">
                                  <h4 className="font-semibold text-gray-700 mb-2">
                                    Feedback:
                                  </h4>
                                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg leading-relaxed">
                                    {point.pointMissed}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No scoring data available
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AICourseModal;
