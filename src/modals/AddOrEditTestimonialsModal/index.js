import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import classes from "./AddOrEditTestimonialsModal.module.css";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import UploadImageBox from "@/components/UploadImageBox";
import ModalSkeleton from "../ModalSkeleton";

const AddOrEditTestimonialsModal = ({
  show,
  onClose,
  onClick,
  loading,
  data,
}) => {
  const [title, setTitle] = useState(data?.name || "");
  const [image, setImage] = useState(data?.photo || null);
  const [description, setDescription] = useState(data?.message || null);
  const [stars, setStars] = useState(data?.stars || null);

  const HandleSubmit = () => {
    const params = {
      name: title,
      photo: image,
      message: description,
    };
    for (let key in params) {
      if (!params[key]) {
        return toast.error("Please fill all the fields");
      }
    }
    params.stars = stars;

    onClick(params);
  };

  return (
    <>
      <ModalSkeleton
        header={`${data != undefined ? "Edit" : "Add"} ${"Testimonial"}`}
        show={show}
        setShow={onClose}
      >
        <Row className={`gx-0 gy-3 ${classes.mainDiv}`}>
          <Col md={12} lg={12}>
            <Input
              type={"text"}
              placeholder={`Enter Testimonial Title`}
              label={`Title`}
              value={title}
              setter={setTitle}
              labelColor={"var(--text-black-color)"}
            />
          </Col>
          <Col md={12} lg={12}>
            <Input
              type={"number"}
              placeholder={`Enter Testimonial Rating`}
              label={`Rating`}
              value={stars}
              setter={(e) => {
                if (Number(e) > 5)
                  return toast.error("Rating must be in between 0 to 5");
                setStars(e);
              }}
              max={5}
              min={0}
              labelColor={"var(--text-black-color)"}
            />
          </Col>
          <Col md={12}>
            <UploadImageBox
              label={"Image"}
              state={image}
              setter={setImage}
              variant={"web"}
            />
          </Col>
          <Col md={12}>
            <TextArea
              label={"Description"}
              variant={"web"}
              value={description}
              setter={setDescription}
            />
          </Col>

          <Col md={12} lg={12} className={classes?.btnContainer}>
            <Button
              className={classes.submitBtn}
              label={loading ? "Submitting.." : "Submit"}
              onClick={HandleSubmit}
              disabled={loading}
            />
          </Col>
        </Row>
      </ModalSkeleton>
    </>
  );
};

export default AddOrEditTestimonialsModal;
