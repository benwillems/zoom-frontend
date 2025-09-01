import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const ProgramStatusBar = ({
  clientDetails,
  size,
  weight,
  showDetails,
  onMouseEnter,
  onMouseLeave,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  let sizeCSS = size ? `text-${size}` : "";
  let weightCSS = weight ? `font-${weight}` : "";

  const pauseDates = clientDetails?.ProgramToClient?.[0]?.pauseDates;

  return (
    <>
      <div className="flex items-center justify-center">
        <p
          className={`text-center ${sizeCSS} ${weightCSS} first-letter:uppercase text-xl font-medium uppercase`}
        >
          {clientDetails?.ProgramToClient?.[0]?.program?.name ||
            "No Program enrolled"}
        </p>

        {showDetails && (
          <FaInfoCircle
            className="text-blue-600 cursor-pointer text-xl mr-2 ml-2"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        )}
      </div>

      <div className="mt-2">
        {clientDetails?.ProgramToClient?.[0]?.startDate
          ? (() => {
              const startDate = new Date(
                clientDetails.ProgramToClient[0].startDate
              );
              const endDate = new Date(clientDetails.ProgramToClient[0].endDate);
              const currentDate = new Date();
              const currentDateOnly = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate()
              );
              const duration =
                clientDetails?.ProgramToClient?.[0]?.program?.duration;
              const ProgramStatus =
                clientDetails?.ProgramToClient?.[0]?.ProgramStatus;
              const daysLeft =
                (endDate - currentDateOnly  ) / (1000 * 60 * 60 * 24);
              // const daysLeft = Math.max(duration - elapsed + 1, 0);
              const progressValue =
                ((Math.ceil(duration) - Math.ceil(daysLeft)) /
                  Math.ceil(duration)) *
                100;

              // Handle status based on ProgramStatus enum
              if (ProgramStatus === "PAUSED" && pauseDates?.length > 0) {
                const pauseDate = new Date(pauseDates[0]); // Use the first pause date

                return (
                  <div>
                    <div className="relative w-full h-2 bg-gray-300 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded"
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-center text-sm text-gray-700">
                      Paused on {formatDate(pauseDate)}
                    </div>
                  </div>
                );
              } else if (ProgramStatus === "SCHEDULED") {
                return (
                  <div>
                    <div className="relative w-full h-2 bg-gray-300 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                    <div className="mt-1 text-center text-sm text-gray-700">
                      Starting from {formatDate(startDate)}
                    </div>
                  </div>
                );
              } else if (ProgramStatus === "COMPLETED") {
                return (
                  <div>
                    <div className="relative w-full h-2 bg-gray-300 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                    <div className="mt-1 text-center text-sm text-gray-700">
                      Program Completed
                    </div>
                  </div>
                );
              } else if (ProgramStatus === "CANCELLED") {
                return (
                  <div>
                    <div className="relative w-full h-2 bg-gray-300 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-red-500 rounded"
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-center text-sm text-red-700">
                      Program Cancelled
                    </div>
                  </div>
                );
              } else if (ProgramStatus === "ACTIVE") {
                return (
                  <div>
                    <div className="relative w-full h-2 bg-gray-300 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded"
                        style={{ width: `${progressValue}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-center text-sm text-gray-700">
                      {`${Math.ceil(daysLeft)} days remaining`}
                    </div>
                  </div>
                );
              }
            })()
          : ""}
      </div>
    </>
  );
};

export default ProgramStatusBar;