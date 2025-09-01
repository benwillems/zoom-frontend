import React, { useEffect, useState } from "react";
import ReactBigCalendar from "@/components/ui/Calendar/ReactBigCalendar";
import useSearchClientsStore from "@/store/useSearchClientsStore";
import useOrgStore from "@/store/useOrgStore";
import { useRouter } from "next/router";
import { fetchWithAuth } from "@/utils/generalUtils";

const Schedule = () => {
  const router = useRouter();
  const { fetchClients } = useSearchClientsStore();
  const { details, fetchOrgDetails } = useOrgStore();
  const [events, setEvents] = useState([]);

  const fetchAllAppointments = () => {
    fetchWithAuth("/api/appointments?status=SCHEDULED,SUCCEEDED,PAUSED")
      .then((response) => response.json())
      .then((data) => {
        let listOfObjects = data.map((obj) => {
          obj.start = new Date(obj.scheduleStartAt);
          obj.end = new Date(obj.scheduleEndAt);
          return obj;
        });
        setEvents(listOfObjects);
      })
      .catch((error) => console.error("Error fetching pets:", error));
  };

  useEffect(() => {
    if (details == undefined || details == null) {
      fetchOrgDetails(router);
    }
  }, []);

  useEffect(() => {
    if (details) {
      fetchAllAppointments();
      fetchClients();
    }
  }, [details]);

  return (
    <div className="flex justify-center">
      <ReactBigCalendar
        events={events}
        setEvents={setEvents}
        fetchAllAppointments={fetchAllAppointments}
      />
    </div>
  );
};

export default Schedule;
