import { useState } from "react";
import { toast } from "react-toastify";
import classes from "./AddFeedbackModal.module.css";
import Button from "@/components/Button";
import TextArea from "@/components/TextArea";
import { Col, Row } from "antd";
import { Rating } from "react-simple-star-rating";
import ModalSkeleton from "../ModalSkeleton";

const AddFeedbackModal = ({ show, setShow, onClick }) => {
  const [rating, setRating] = useState();
  const [description, setDescrition] = useState("");
  const [loading, setLoading] = useState(false);

  const HandleSubmit = async () => {
    const params = {
      rating,
      feedback: description,
    };
    if (!rating) {
      return toast.error(
        "Please rate your experience by selecting the appropriate number of stars"
      );
    }
    if (!description) {
      return toast.error("Please provide your feedback description");
    }

    setLoading(true);
    await onClick(params);
    setLoading(false);
  };

  return (
    <>
      <ModalSkeleton
        header={`Feedback`}
        show={show}
        setShow={setShow}
        showCloseIcon={false}
      >
        <Row className={` ${classes.mainDiv} `} gutter={[16, 16]}>
          <Col xs={24}>
            <h5 className="mb-3 dark:text-white text-center">
              Rate your experience
            </h5>
            <div className="flex justify-center mt-3">
              <Rating
                initialValue={rating}
                onClick={setRating}
                allowFraction={true}
                starDimension="40px"
                starSpacing="15px"
                changeRating={setRating}
                iconsCount={5}
                size={25}
                transition
                allowHover
              />
            </div>
          </Col>
          <Col xs={24}>
            <TextArea
              placeholder={`Describe your journey with us`}
              label={`Describe your journey with us`}
              value={description}
              setter={setDescrition}
              labelColor={"var(--text-black-color)"}
              variant="web"
            />
          </Col>

          <Col xs={24} className={"text-center"}>
            <Button
              className={classes.submitBtn}
              label={loading ? "Wait..." : "Submit"}
              onClick={HandleSubmit}
              disabled={loading}
            />
          </Col>
        </Row>
      </ModalSkeleton>
    </>
  );
};

export default AddFeedbackModal;
