import { Modal } from 'antd';
import { AiOutlineClose } from 'react-icons/ai';
import classes from './modalSkeleton.module.css';

export default function ModalSkeleton({
  show,
  setShow,
  header,
  footer,
  children,
  modalClass,
  headerStyles,
  footerStyles,
  showCloseIcon = true,
  width,
  headerClass,
  closeIconClass,
  contentClass = '',
}) {
  function handleClose() {
    setShow(false);
  }

  return (
    <>
      <Modal
        open={show}
        onCancel={handleClose}
        centered
        width={width}
        footer={footer ? <div style={{ ...footerStyles }}>{footer}</div> : null}
        className={`${[modalClass, classes.modal].join(' ')}`}
        closeIcon={
          showCloseIcon && (
            <div
              className={[
                classes.iconBox,
                closeIconClass && closeIconClass,
              ].join(' ')}
              onClick={handleClose}
            >
              <AiOutlineClose size={20} color={'var(--white-color)'} />
            </div>
          )
        }
      >
        {header && (
          <div
            className={`${[classes.header, headerClass && headerClass].join(
              ' '
            )}`}
            style={{ ...headerStyles }}
          >
            <h6>{header}</h6>
          </div>
        )}
        <div
          className={`px-[20px] py-[40px] dark:!bg-[var(--page-bg-color)] max-h-[70vh] overflow-y-auto ${contentClass}`}
        >
          {children}
        </div>
      </Modal>
    </>
  );
}
