const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5285";

export async function getClasses() {
  const response = await fetch(`${API_BASE_URL}/classes`);

  if (!response.ok) {
    throw new Error("Could not load classes.");
  }

  return response.json();
}

export async function createHold(classId, studentId, studentDetails) {
  const response = await fetch(
    `${API_BASE_URL}/classes/${classId}/holds`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Student-Id": studentId,
      },
      body: JSON.stringify(studentDetails),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not create admission hold.");
  }

  return data;
}

export async function getMyHolds(studentId) {
  const response = await fetch(`${API_BASE_URL}/me/holds`, {
    method: "GET",
    headers: {
      "X-Student-Id": studentId,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load admission records.");
  }

  return response.json();
}

export async function createClass(classDetails) {
  const response = await fetch(`${API_BASE_URL}/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(classDetails),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not create class.");
  }

  return data;
}