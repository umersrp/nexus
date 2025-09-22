import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import classes from "./AddOrEditCategoryModal.module.css";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import UploadImageBox from "@/components/UploadImageBox";
import ModalSkeleton from "../ModalSkeleton";

const AddOrEditCategoryModal = ({ show, onClose, onClick, loading, data }) => {
  const [title, setTitle] = useState(data?.name || "");
  const [image, setImage] = useState(data?.image || null);
  const [description, setDescription] = useState(data?.description || null);

  const HandleSubmit = () => {
    const params = {
      name: title,
      image,
      description,
    };
    for (let key in params) {
      if (!params[key]) {
        return toast.error("Please fill all the fields");
      }
    }

    onClick(params);
  };

  return (
    <>
      <ModalSkeleton
        header={`${data != undefined ? "Edit" : "Add"} ${"Category"}`}
        show={show}
        setShow={onClose}
      >
        <Row className={`gx-0 gy-3 ${classes.mainDiv}`}>
          <Col md={12} lg={12}>
            <Input
              type={"text"}
              placeholder={`Enter Category Name`}
              label={`Title`}
              value={title}
              setter={setTitle}
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

export default AddOrEditCategoryModal;
