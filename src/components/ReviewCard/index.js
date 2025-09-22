"use client";
import { imageUrl } from "@/config/apiUrl";
import ShowMoreShowLessText from "../ShowMoreShowLess/ShowMoreShowLessText";
import { Rating } from "react-simple-star-rating";
import classes from "./ReviewCard.module.css";
import Image from "next/image";

function ReviewCard({ data }) {
  return (
    <div className={classes?.card}>
      <div className={classes?.imgDiv}>
        <Image src={imageUrl(data?.photo)} alt={data?.name} fill />
      </div>
      <div>
        <h6>{data?.name}</h6>
        <ShowMoreShowLessText text={data?.message} visibility={50} />
        <Rating
          size={20}
          initialValue={data?.stars}
          readOnly={true}
          fillColor={"#FF9737"}
        />
      </div>
    </div>
  );
}

export default ReviewCard;
