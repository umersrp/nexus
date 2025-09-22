import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import classes from "./UpdateOrderStatusModal.module.css";

import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import Input from "@/components/Input";
import ModalSkeleton from "../ModalSkeleton";

const statusOptions = [
  { _id: "PENDING", name: "Pending" },
  { _id: "IN-PROCESS", name: "In Process" },
  { _id: "COMPLETED", name: "Completed" },
];

const UpdateOrderStatusModal = ({ show, setShow, onClick, loading, data }) => {
  const [progress, setProgress] = useState(data?.progress);

  const [status, setStatus] = React.useState(
    statusOptions?.find((e) => data?.status == e?._id)
  );

  const HandleSubmit = () => {
    const params = {
      status,
      progress,
    };
    for (let key in params) {
      if (!params[key]) {
        return toast.error("Please fill all the fields");
      }
    }

    onClick(params);
  };
  const currentStatusIndex = statusOptions?.findIndex(
    (e) => data?.status == e?._id
  );
  const remainOptions = statusOptions?.slice(currentStatusIndex);

  return (
    <>
      <ModalSkeleton
        header={`Update Order Status`}
        show={show}
        setShow={setShow}
      >
        <Row className={`gx-0 gy-3 ${classes.mainDiv}`}>
          <Col md={12} lg={12}>
            <DropDown
              placeholder={`Enter status here`}
              label={`Status`}
              value={status}
              setter={setStatus}
              labelColor={"var(--text-black-color)"}
              optionLabel={"name"}
              optionValue={"_id"}
              options={remainOptions}
            />
          </Col>
          <Col md={12} lg={12}>
            <Input
              type={"number"}
              placeholder={`Enter progress here`}
              label={`Progress (%)`}
              value={progress}
              setter={(e) => {
                if (Number(e) > 100) {
                  return toast.error(
                    "Please enter progress in between 0 to 100"
                  );
                }
                setProgress(e);
              }}
              labelColor={"var(--text-black-color)"}
            />
          </Col>
          <Col md={12} lg={12} className={classes?.btnContainer}>
            <Button
              className={classes.submitBtn}
              label={loading ? "Updating.." : "Update"}
              onClick={HandleSubmit}
              disabled={loading}
            />
          </Col>
        </Row>
      </ModalSkeleton>
    </>
  );
};

export default UpdateOrderStatusModal;
