import React from "react";

const ShowMoreShowLessText = ({ text, visibility = 30, className }) => {
  const [isshowingMore, setIsShowingMore] = React.useState(false);

  return (
    <p className={["mb-0", className].join(" ")}>
      {text?.substring(0, isshowingMore ? text.length : visibility)}
      {text?.length > visibility && !isshowingMore && "..."}{" "}
      {text?.length > visibility && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsShowingMore((p) => !p);
          }}
          style={{
            color: "var(--primary-color)",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {" "}
          {isshowingMore ? "Show Less" : "Show More"}
        </span>
      )}
    </p>
  );
};

export default ShowMoreShowLessText;
