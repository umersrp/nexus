"use client";
import axios from "axios";
import { toast } from "react-toastify";

let Get = async (route, accessToken, showAlert = true) => {
  const options = accessToken
    ? {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : {
        headers: {
          Accept: "application/json",
        },
      };
  try {
    const response = await axios.get(route, options);
    return response;
  } catch (error) {
    if (showAlert == true) {
      if (error.message === "Network Error") {
        toast.error(`${error.message} : Please Check Your Network Connection`, {
          position: "top-center",
        });
      } else if (error.response.status == 400) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      } else if (error.response.status == 401) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      }
    }
  }
};

let Post = async (route, data, headers, showAlert = true) => {
  try {
    return await axios.post(route, data, headers);
  } catch (error) {
    console.log({ error });
    if (showAlert == true) {
      if (error.message === "Network Error") {
        toast.error(`${error.message} : Please Check Your Network Connection`, {
          position: "top-center",
        });
      } else if (error.response?.status == 400) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      } else if (error.response?.status == 401) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      }
    }
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};

let Patch = async (route, data, headers, showAlert = true) => {
  try {
    return await axios.patch(route, data, headers);
  } catch (error) {
    if (error.message === "Network Error") {
      toast.error(`${error.message} : Please Check Your Network Connection`, {
        position: "top-center",
      });
    } else if (error.response.status == 400) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
    } else if (error.response.status == 401) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
    } else {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
    }
  }
};

let Put = async (route, data, headers, showAlert = true) => {
  try {
    return await axios.put(route, data, headers);
  } catch (error) {
    console.log({ error });
    if (showAlert == true) {
      if (error.message === "Network Error") {
        toast.error(`${error.message} : Please Check Your Network Connection`, {
          position: "top-center",
        });
      } else if (error.response?.status == 400) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      } else if (error.response?.status == 401) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-center",
        });
      }
    }
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};

let Delete = async (route, data, token, showAlert = true) => {
  try {
    return data == null
      ? await axios.delete(route, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: {},
        })
      : await axios.delete(route, {
          data,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  } catch (error) {
    if (error.message === "Network Error") {
      toast.error(`${error.message} : Please Check Your Network Connection`, {
        position: "top-center",
      });
    } else if (error.response.status == 400) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
    } else if (error.response.status == 401) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
    } else {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
    }
  }
};
export { Post, Put, Get, Patch, Delete };
