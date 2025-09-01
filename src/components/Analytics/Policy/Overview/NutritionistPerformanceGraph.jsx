import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Select, { components } from "react-select";
import { fetchWithAuth } from "@/utils/generalUtils";

const ResponsiveBarCanvas = dynamic(
  () => import("@nivo/bar").then((module) => module.ResponsiveBarCanvas),
  { ssr: false }
);

const ResponsiveRadar = dynamic(
  () => import("@nivo/radar").then((module) => module.ResponsiveRadar),
  { ssr: false }
);

const ResponsiveLineCanvas = dynamic(
  () => import("@nivo/line").then((module) => module.ResponsiveLineCanvas),
  { ssr: false }
);

const CustomTooltip = ({ name, value, metric }) => {
  const formatValue = (value, metricType) => {
    switch (metricType) {
      case "duration":
        return `${value} min`;
      case "satisfaction":
        return `${value} / 5`;
      case "successRate":
      case "noShowRate":
      case "cancellationRate":
        return `${value}%`;
      default:
        return value;
    }
  };

  return (
    <div className="flex flex-col bg-gray-800 text-white px-3 py-2 rounded-md text-base">
      <strong className="text-base">{metric}</strong>
      <div>
        {name}: {formatValue(value, metric.toLowerCase())}
      </div>
    </div>
  );
};

const metricOptions = [
  { value: "total", label: "Total Calls" },
  { value: "succeeded", label: "Succeeded Calls" },
  { value: "successRate", label: "Success Rate (%)" },
  { value: "noShow", label: "No Show" },
  { value: "noShowRate", label: "No Show Rate (%)" },
  { value: "cancellationRate", label: "Cancellation Rate (%)" },
];

const timeOptions = [
  { value: "last seven days", label: "Last 7 Days" },
  { value: "last month", label: "Last Month" },
  { value: "last three months", label: "Last 3 Months" },
];

const chartTypes = [
  { value: "bar", label: "Bar Chart" },
  // { value: 'line', label: 'Line Chart' },
  { value: "radar", label: "Radar Chart" },
];

const PerformanceGraph = ({ period }) => {
  const [selectedMetric, setSelectedMetric] = useState(metricOptions[0]);
  const [selectedTime, setSelectedTime] = useState(timeOptions[0]);
  const [chartType, setChartType] = useState(chartTypes[0]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]); // Add state for temporary user selection
  const [availableUsers, setAvailableUsers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(false);

  // Define a color palette (you can use any palette you like)
  const userColors = [
    "#4F8EF7", // blue
    "#F76D4F", // orange
    "#4FF7A2", // green
    "#F7E94F", // yellow
    "#B04FF7", // purple
    "#F74F8E", // pink
    "#4FF0F7", // cyan
    "#F7B54F", // gold
    "#7D4FF7", // indigo
    "#4FF76D", // light green
  ];

  // Map user name to color
  const getUserColor = (userName) => {
    const idx = selectedUsers.findIndex((u) => u.label === userName);
    return userColors[idx % userColors.length];
  };

  // Function to calculate date range based on period
  const getDateRange = (period) => {
    let endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "last seven days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "last month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "last three months":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Add one day to end date to include the last day in range
    endDate.setDate(endDate.getDate() + 1);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Fetch available users from organization
  const fetchAvailableUsers = async () => {
    try {
      // Get users from organization store or API
      const response = await fetchWithAuth("/api/organization/users");
      const data = await response.json();

      const userOptions =
        data.users?.map((user) => ({
          value: user.id,
          label: user.name,
        })) || [];

      setAvailableUsers(userOptions);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Fallback to empty array if API fails
      setAvailableUsers([]);
    }
  };

  // Fetch analytics data for selected users
  const fetchAnalyticsData = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    const { startDate, endDate } = getDateRange(selectedTime.value);
    const newAnalyticsData = {};

    try {
      // Fetch data for each selected user
      for (const user of selectedUsers) {
        const queryParams = new URLSearchParams({
          startDate,
          endDate,
          userId: user.value.toString(),
          compare: "true",
        });

        const response = await fetchWithAuth(
          `/api/analytics/appointments?${queryParams}`
        );
        const data = await response.json();

        // Extract user data from byUser array
        const userData =
          data.byUser?.find((u) => u.userId === user.value) || data.byUser?.[0];

        if (userData) {
          newAnalyticsData[user.label] = {
            ...userData,
            // Convert rates to percentages for display
            successRatePercent: Math.round(userData.successRate * 100),
            noShowRatePercent: Math.round(userData.noShowRate * 100),
            cancellationRatePercent: Math.round(
              userData.cancellationRate * 100
            ),
          };
        }
      }

      setAnalyticsData(newAnalyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  // Fetch analytics data when users or time period changes
  useEffect(() => {
    if (selectedUsers.length > 0) {
      fetchAnalyticsData();
    } else {
      setAnalyticsData({}); // Clear data when no users selected
    }
  }, [selectedUsers, selectedTime]);

  // Sync with parent period if provided
  useEffect(() => {
    if (period) {
      const matchingTimeOption = timeOptions.find(
        (option) => option.value === period
      );
      if (matchingTimeOption) {
        setSelectedTime(matchingTimeOption);
      }
    }
  }, [period]);

  const formatData = () => {
    if (Object.keys(analyticsData).length === 0) return [];

    if (chartType.value === "radar") {
      const metricLabel = selectedMetric.label;
      return Object.entries(analyticsData).map(([userName, data]) => {
        let value = data[selectedMetric.value];

        // Use percentage values for rates
        if (selectedMetric.value === "successRate")
          value = data.successRatePercent;
        if (selectedMetric.value === "noShowRate")
          value = data.noShowRatePercent;
        if (selectedMetric.value === "cancellationRate")
          value = data.cancellationRatePercent;

        return {
          nutritionist: userName,
          [metricLabel]: value,
        };
      });
    }

    if (chartType.value === "bar") {
      return Object.entries(analyticsData).map(([userName, data]) => {
        let value = data[selectedMetric.value];

        // Use percentage values for rates
        if (selectedMetric.value === "successRate")
          value = data.successRatePercent;
        if (selectedMetric.value === "noShowRate")
          value = data.noShowRatePercent;
        if (selectedMetric.value === "cancellationRate")
          value = data.cancellationRatePercent;

        return {
          nutritionist: userName,
          value: value,
        };
      });
    }

    // For line chart, we'll use current data as single point
    // You might want to modify your API to return historical data for line charts
    return Object.entries(analyticsData).map(([userName, data]) => {
      let value = data[selectedMetric.value];

      // Use percentage values for rates
      if (selectedMetric.value === "successRate")
        value = data.successRatePercent;
      if (selectedMetric.value === "noShowRate") value = data.noShowRatePercent;
      if (selectedMetric.value === "cancellationRate")
        value = data.cancellationRatePercent;

      return {
        id: userName,
        data: [
          {
            x: "Current Period",
            y: value,
          },
        ],
      };
    });
  };

  const handleUserChange = (selectedOptions) => {
    // Allow up to 5 users, but don't close or reset
    if (!selectedOptions) {
      setSelectedUsers([]);
      return;
    }
    if (selectedOptions.length <= 5) {
      setSelectedUsers(selectedOptions);
    }
  };

  const commonProps = {
    margin: { top: 20, right: 120, bottom: 110, left: 60 },
    animate: true,
    theme: {
      text: {
        fontSize: 16,
      },
      axis: {
        ticks: {
          text: {
            fontSize: 11,
          },
        },
        legend: {
          text: {
            fontSize: 17,
            fontWeight: "bold",
          },
        },
      },
    },
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-lg">Loading analytics data...</div>
        </div>
      );
    }

    if (selectedUsers.length === 0) {
      return (
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-lg text-gray-500">
            Please select users to display analytics
          </div>
        </div>
      );
    }

    if (Object.keys(analyticsData).length === 0) {
      return (
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-lg text-gray-500">
            No data available for selected period
          </div>
        </div>
      );
    }

    if (chartType.value === "radar") {
      return (
        <ResponsiveRadar
          data={formatData()}
          keys={[selectedMetric.label]}
          indexBy="nutritionist"
          maxValue="auto"
          margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
          curve="linearClosed"
          borderWidth={2}
          borderColor={{ from: "color" }}
          gridLevels={5}
          gridShape="circular"
          gridLabelOffset={36}
          enableDots={true}
          dotSize={10}
          dotColor={{ theme: "background" }}
          dotBorderWidth={2}
          dotBorderColor={{ from: "color" }}
          enableDotLabel={true}
          dotLabel="value"
          dotLabelYOffset={-12}
          colors={{ scheme: "nivo" }}
          fillOpacity={0.25}
          blendMode="multiply"
          animate={true}
          isInteractive={true}
          legends={[
            {
              anchor: "top-left",
              direction: "column",
              translateX: -50,
              translateY: -40,
              itemWidth: 80,
              itemHeight: 20,
              itemTextColor: "#999",
              symbolSize: 12,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        />
      );
    }

    if (chartType.value === "bar") {
      return (
        <ResponsiveBarCanvas
          data={formatData()}
          keys={["value"]}
          indexBy="nutritionist"
          margin={{ top: 20, right: 0, bottom: 120, left: 80 }}
          padding={0.3}
          borderRadius={4}
          axisBottom={{
            tickRotation: -30,
            legend: "Nutritionists",
            legendPosition: "middle",
            legendOffset: 75,
            legendStyle: {
              fontSize: 16,
              fontWeight: 600,
            },
          }}
          animate={true}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 13,
                },
              },
              legend: {
                text: {
                  fontSize: 16,
                  fontWeight: "bold",
                },
              },
            },
          }}
          axisLeft={{
            legend: selectedMetric.label,
            legendPosition: "middle",
            legendOffset: -65,
            legendStyle: {
              fontSize: 16,
              fontWeight: 600,
            },
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          enableLabel={true}
          label={(d) => d.value}
          labelTextColor="#ffffff"
          labelStyle={{
            fontSize: 14,
            fontWeight: 700,
          }}
          tooltip={({ indexValue, value }) => (
            <CustomTooltip
              name={indexValue}
              value={value}
              metric={selectedMetric.label}
            />
          )}
          // Assign color per user
          colors={(bar) => getUserColor(bar.data.nutritionist)}
        />
      );
    }

    return (
      <ResponsiveLineCanvas
        data={formatData()}
        {...commonProps}
        enablePoint={true}
        pointSize={8}
        pointBorderWidth={2}
        enableGridX={true}
        lineWidth={3}
        colors={{ scheme: "tableau10" }}
        axisBottom={{
          tickRotation: -45,
          legend: selectedTime.label,
          legendPosition: "middle",
          legendOffset: 65,
        }}
        axisLeft={{
          legend: selectedMetric.label,
          legendPosition: "middle",
          legendOffset: -50,
        }}
        useMesh={true}
        enableSlices="x"
        tooltip={({ point }) => (
          <CustomTooltip
            name={point.serieId}
            value={point.data.y}
            color={point.serieColor}
            metric={selectedMetric.label}
          />
        )}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 25,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
          },
        ]}
      />
    );
  };

  const selectStyles = {
    menu: (base) => ({
      ...base,
      zIndex: 20,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 20,
    }),
  };

  const Option = (props) => {
    const isSelected = tempSelectedUsers.some(
      (user) => user.value === props.data.value
    );

    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => null}
          style={{ marginRight: "10px" }}
        />
        {props.label}
      </components.Option>
    );
  };

  const CustomDropdown = ({ children, innerRef, innerProps }) => {
    return (
      <div ref={innerRef} {...innerProps}>
        {children}
        <div
          style={{
            padding: "10px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f7fafc", // Tailwind blue-100
            textAlign: "center",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Set the actual selected users and fetch data
              setSelectedUsers(tempSelectedUsers);
              // Close the dropdown by blurring
              if (innerRef.current) {
                const selectInput =
                  innerRef.current.closest(".select__control");
                if (selectInput) {
                  selectInput.blur();
                }
              }
            }}
            style={{
              backgroundColor: "#4F8EF7", // Tailwind blue-100
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
            disabled={tempSelectedUsers.length === 0}
          >
            Apply Selection ({tempSelectedUsers.length})
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-md border w-full h-[500px] z-0">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          Nutritionist Performance Comparison
        </h2>
        <div className="flex flex-col gap-4 mb-4">
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full flex-1">
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                options={metricOptions}
                className="w-full"
                classNamePrefix="select"
                placeholder="Select Metric"
                styles={selectStyles}
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={tempSelectedUsers}
                onChange={(selectedOptions) => {
                  // Update temp selection, don't close dropdown
                  if (!selectedOptions) {
                    setTempSelectedUsers([]);
                    return;
                  }
                  if (selectedOptions.length <= 5) {
                    setTempSelectedUsers(selectedOptions);
                  }
                }}
                options={availableUsers}
                isMulti
                className="w-full"
                classNamePrefix="select"
                placeholder="Select Users"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{ Option, Menu: CustomDropdown }}
                styles={{
                  menu: (base) => ({
                    ...base,
                    zIndex: 20,
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 20,
                  }),
                  // Hide the selected values in the control
                  multiValue: () => ({
                    display: "none",
                  }),
                  // Keep placeholder visible
                  placeholder: (base) => ({
                    ...base,
                    color: "#111827", // Tailwind gray-900
                  }),
                  // Style the control to show count instead of names
                  control: (base) => ({
                    ...base,
                    minHeight: "38px",
                  }),
                }}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : null
                }
                isDisabled={loading}
                noOptionsMessage={() =>
                  loading ? "Loading users..." : "No users available"
                }
                // Custom formatting to show count
                formatOptionLabel={(option, { context }) => {
                  if (context === "value") {
                    return null; // Don't show anything in the control
                  }
                  return option.label;
                }}
                // Override the displayed value
                getOptionValue={(option) => option.value}
                // Custom control content
                controlShouldRenderValue={false}
              />
              {/* {tempSelectedUsers.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {tempSelectedUsers.length} user{tempSelectedUsers.length !== 1 ? 's' : ''} selected
        </div>
      )} */}
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={selectedTime}
                onChange={setSelectedTime}
                options={timeOptions}
                className="w-full"
                classNamePrefix="select"
                placeholder="Select Time Period"
                // isDisabled={chartType.value === 'bar'}
                styles={selectStyles}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={chartType}
                onChange={(newType) => {
                  setChartType(newType);
                  if (newType.value === "line") {
                    setSelectedTime(timeOptions[0]);
                  }
                }}
                options={chartTypes}
                className="w-full"
                classNamePrefix="select"
                placeholder="Select Chart Type"
                styles={selectStyles}
              />
            </div>
          </div>
        </div>
        <div className="h-[400px]">{renderChart()}</div>
      </div>
    </div>
  );
};

export default PerformanceGraph;
