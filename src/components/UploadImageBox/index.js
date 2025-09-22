import { useRef } from "react";
import { AiFillVideoCamera } from "react-icons/ai";
import { CgImage } from "react-icons/cg";
import { MdClose, MdModeEdit, MdUpload } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { imageUrl } from "../../config/apiUrl";
import classes from "./UploadImageBox.module.css";

function UploadImageBox({
  state,
  setter,
  label,
  edit = true,
  onDelete,
  onClose,
  isCloseable,
  imgClass = "",
  imgBoxClass = "",
  onClick,
  isVideo,
  variant = "",
}) {
  const inputRef = useRef(null);
  return (
    <div className={classes.box}>
      {label && <label>{label}</label>}

      <div
        className={[classes.uploadImageBox, imgBoxClass].join(" ")}
        data-variant={variant}
      >
        {/* Close Icon */}
        {isCloseable && (
          <span className={classes.closeIcon} onClick={onClose}>
            <MdClose />
          </span>
        )}
        {isVideo ? (
          <div
            className={`${classes.imageUploaded} d-flex justify-content-center align-items-center`}
          >
            <AiFillVideoCamera fill="#242342" size={40} />
          </div>
        ) : state?.name || typeof state == "string" ? (
          <div className={classes.imageUploaded}>
            <img
              src={
                typeof state == "object"
                  ? URL.createObjectURL(state)
                  : imageUrl(state)
              }
              className={imgClass && imgClass}
              alt={"Upload"}
            />
            <div className={classes.editAndDelete}>
              {edit && (
                <>
                  {onDelete && (
                    <div className={classes.icon} onClick={onDelete}>
                      <RiDeleteBinLine />
                    </div>
                  )}
                  <div
                    className={classes.icon}
                    onClick={() => inputRef.current.click()}
                  >
                    <MdModeEdit />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={classes.uploadBox}>
            <CgImage className={classes.icon} />
            <div
              className={classes.uploadIcon}
              onClick={() => inputRef.current.click()}
            >
              <MdUpload />
            </div>
          </div>
        )}
      </div>
      <input
        hidden
        type={"file"}
        ref={inputRef}
        onChange={
          onClick
            ? onClick
            : (e) => {
                if (
                  ![
                    "image/png",
                    "image/jpeg",
                    "image/jpg",
                    "image/gif",
                  ].includes(e?.target?.files?.[0]?.type)
                ) {
                  return toast.error(
                    "Please upload only png, jpeg, gif files only"
                  );
                }
                setter(e.target.files[0]);
              }
        }
      />
    </div>
  );
}

export default UploadImageBox;
