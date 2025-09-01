import { fetchWithAuth } from "@/utils/generalUtils";

const pauseResumeProgram = async ({ id, clientId }) => {
  const payload = {
    clientId: clientId,
  };

  const response = await fetchWithAuth(
    `/api/client/program/pause/${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
};

const cancelProgram = async ({ id, clientId }) => {
  const payload = {
    clientId: clientId,
  };

  const response = await fetchWithAuth(
    `/api/client/program/cancel/${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
};

module.exports = {
  pauseResumeProgram,
  cancelProgram,
};
