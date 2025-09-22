import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import classes from "./AddMilestoneModal.module.css";

import Button from "@/components/Button";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import UploadImageBox from "@/components/UploadImageBox";
import ModalSkeleton from "../ModalSkeleton";

const AddMilestoneModal = ({ show, setShow, onClick, loading, orderId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescrition] = useState("");
  const [files, setFiles] = useState([null]);

  const HandleSubmit = () => {
    const params = {
      title,
      description,
      images: files?.filter((e) => e instanceof File),
      orderId,
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
      <ModalSkeleton header={`Add Milestone`} show={show} setShow={setShow}>
        <Row className={`gx-0 gy-3 ${classes.mainDiv}`}>
          <Col md={12} lg={12}>
            <Input
              placeholder={`Enter title here`}
              label={`Title`}
              value={title}
              setter={setTitle}
              labelColor={"var(--text-black-color)"}
            />
          </Col>
          <Col md={12} lg={12}>
            <TextArea
              placeholder={`Enter description here`}
              label={`Description`}
              value={description}
              setter={setDescrition}
              labelColor={"var(--text-black-color)"}
              variant="web"
            />
          </Col>
          <Col md={12}>
            <div className={classes?.labelAndAddMoreBtn}>
              <label>Images</label>
              <Button
                onClick={() => {
                  if (files?.length < 10) {
                    setFiles((prev) => [...prev, null]);
                  } else {
                    return toast.error("You can upload maximum 10 Images");
                  }
                }}
              >
                Add More
              </Button>
            </div>
            <Row className={"mt-2 gy-2"}>
              {files?.map((e, i) => (
                <Col md={6} key={i}>
                  <UploadImageBox
                    state={e}
                    setter={(a) => {
                      const newImg = [...files];
                      newImg?.splice(i, 1, a);
                      setFiles(newImg);
                    }}
                    onDelete={() => {
                      const newImg = [...fields?.image];
                      newImg?.splice(i, 1);
                      setFiles(newImg);
                    }}
                    imgBoxClass={classes?.img}
                  />
                </Col>
              ))}
            </Row>
          </Col>

          <Col md={12} lg={12} className={classes?.btnContainer}>
            <Button
              className={classes.submitBtn}
              label={loading ? "Adding.." : "Add"}
              onClick={HandleSubmit}
              disabled={loading}
            />
          </Col>
        </Row>
      </ModalSkeleton>
    </>
  );
};

export default AddMilestoneModal;
