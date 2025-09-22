import React from "react";
import ModalSkeleton from "../ModalSkeleton";

const ViewPDFModal = ({ show, setShow, data }) => {
  return (
    <>
      <ModalSkeleton
        header={`View Session Transcript`}
        show={show}
        setShow={setShow}
        contentClass="!p-0"
      >
        <iframe src={data} className="w-full h-[calc(68vh-80px)]" />
      </ModalSkeleton>
    </>
  );
};

export default ViewPDFModal;
