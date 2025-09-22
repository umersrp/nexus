"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import LoaderImg from "../../assets/loader.gif";
import classes from "./loader.module.css";

const Loader = ({ showWeb = true, completeLoading = false, children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout;
    if (showWeb && !completeLoading) {
      timeout = setTimeout(() => setLoading(false), 1000);
    } else {
      if (!completeLoading) {
        setLoading(false);
      }
    }
    return () => clearTimeout(timeout);
  }, [completeLoading]);
  return (
    <>
      {loading ? (
        <div
          className={`${classes.loaderContainer} ${showWeb && classes?.hv100}`}
        >
          <Image src={LoaderImg} alt={"loader"} />
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default Loader;
