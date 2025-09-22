"use client";
import { Post } from "@/Axios/AxiosFunctions";
import Button from "@/components/Button";
import IconBtn from "@/components/IconBtn";
import Input from "@/components/Input";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData/NoData";
import UploadImageBox from "@/components/UploadImageBox";
import { apiHeader, BaseURL, CreateFormData } from "@/config/apiUrl";
import {
  deleteProductFromCart,
  emptyCart,
  updateProductQuantity,
} from "@/store/auth/authSlice";
import Box from "@mui/material/Box";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { FaCheck, FaCopy } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { SocialIcon } from "react-social-icons";
import { toast } from "react-toastify";
import classes from "./Cart.module.css";

const steps = ["Cart", "Billing", "Complete"];
function CStepper({ value }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={value} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default function Cart() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cart, accessToken } = useSelector((state) => state?.authReducer);
  const [isApiCalling, setIsApiCalling] = useState(false);

  const [data, setData] = useState(null);

  // New Fields
  const [stepNo, setStepNo] = useState(0);
  const [transactionId, setTransactionId] = useState("");
  const [proof, setProof] = useState(null);

  const deleteThisItem = (index) => {
    dispatch(deleteProductFromCart(index));
  };

  const updateQty = (item, e) => {
    dispatch(updateProductQuantity({ _id: item?._id, quantity: e }));
  };

  // handleSubmit
  const handleSubmit = async () => {
    if (stepNo < 1) {
      return setStepNo((prev) => ++prev);
    }
    if (cart?.length == 0) {
      return setStepNo(1);
    }
    const params = {
      items: cart?.map((e) => ({
        product: e?.product?._id,
        quantity: e?.quantity,
      })),
      transactionId,
      prove: proof,
    };

    // validate
    if (!params?.transactionId)
      return toast.error("Please enter a transaction Id");
    if (!params?.prove) return toast.error("Please enter transaction prove");

    const url = BaseURL(`orders`);
    const formData = CreateFormData(params);

    setIsApiCalling(true);
    const response = await Post(url, formData, apiHeader(accessToken, true));
    setIsApiCalling(false);

    if (response !== undefined) {
      toast.success("You have purchased the products successfully.");
      dispatch(emptyCart());
      setData(response?.data?.data?.order);
      setStepNo(2);
    }
  };

  async function copyToClipboard(textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Text copied to clipboard");
    } catch (err) {}
  }
  return (
    <Loader showWeb={true}>
      <div className={[classes.landingPage].join(" ")}>
        <CStepper value={stepNo} />

        <section className={classes?.mainSection}>
          <Container className={classes?.mainContainer}>
            <style>{`
        .table100-body{
          height:calc(100vh - 200px);
        }
                @media screen and (max-width:992px){
        .table100-head, .table100-body{
          width:1000px;
        }
        .table100{
          overflow-x:scroll !important;
        }

        `}</style>
            <div
              className={[
                classes?.tableDiv,
                stepNo == 2 && classes.paymentComplete,
              ].join(" ")}
            >
              {stepNo == 0 && <h3>Order Summary</h3>}
              {stepNo == 1 && <h3>Billing Info</h3>}
              {stepNo == 0 && (
                <div class="table100 ver1 m-b-110">
                  <div class="table100-head">
                    <table>
                      <thead>
                        <tr class="row100 head">
                          <th
                            class="cell100 column1"
                            style={{ width: "10%", textAlign: "left" }}
                          >
                            S.No
                          </th>
                          <th
                            class="cell100 column3"
                            style={{ width: "30%", textAlign: "left" }}
                          >
                            Services
                          </th>

                          <th
                            class="cell100 column3"
                            style={{ width: "20%", textAlign: "center" }}
                          >
                            Amount
                          </th>
                          <th
                            class="cell100 column3"
                            style={{ width: "15%", textAlign: "center" }}
                          >
                            Quantity
                          </th>
                          <th
                            class="cell100 column3"
                            style={{ width: "15%", textAlign: "center" }}
                          >
                            Total Amount
                          </th>
                          <th
                            class="cell100 column6"
                            style={{ width: "10%", textAlign: "center" }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div class="table100-body js-pscroll ps ps--active-y">
                    <table>
                      <tbody>
                        {cart?.length > 0 ? (
                          cart?.map((item, index) => (
                            <tr class="row100 body" key={item?._id}>
                              <td
                                class="cell100 column1"
                                style={{ width: "10%", textAlign: "left" }}
                              >
                                {index + 1}
                              </td>
                              <td
                                class="cell100 column3"
                                style={{ width: "30%", textAlign: "left" }}
                              >
                                {item?.product?.name}
                              </td>
                              <td
                                class="cell100 column3"
                                style={{ width: "20%", textAlign: "center" }}
                              >
                                {`$${item?.product?.price}`}
                              </td>
                              <td
                                class="cell100 column3"
                                style={{ width: "15%", textAlign: "center" }}
                              >
                                <div className={classes?.quantity}>
                                  <Button
                                    className={`${classes?.addSubBtn}  `}
                                    onClick={() =>
                                      item?.quantity > 1 &&
                                      updateQty(item?.product, -1)
                                    }
                                    variant="secondary"
                                  >
                                    <AiOutlineMinus
                                      size={20}
                                      color={"var(--white-color)"}
                                    />
                                  </Button>
                                  <p>{item?.quantity}</p>
                                  <Button
                                    className={`${classes?.addSubBtn} `}
                                    onClick={() => updateQty(item?.product, +1)}
                                    variant="secondary"
                                  >
                                    <AiOutlinePlus
                                      size={20}
                                      color={"var(--white-color)"}
                                    />
                                  </Button>
                                </div>
                              </td>
                              <td
                                class="cell100 column5"
                                style={{ width: "15%", textAlign: "center" }}
                              >
                                ${item?.quantity * item?.product?.price}
                              </td>

                              <td
                                class="cell100 column6"
                                style={{ width: "10%", textAlign: "center" }}
                              >
                                <div className="jCenter">
                                  <IconBtn
                                    onClick={() => deleteThisItem(index)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="row100 body">
                            <td colSpan={6} className={"w-100"}>
                              <NoData text={"No Items Found"} />
                            </td>
                          </tr>
                        )}

                        {cart?.length > 0 && (
                          <tr
                            class="row100 body pt-3"
                            style={{ borderTop: "1px solid lightgray" }}
                          >
                            <td colSpan={6}>
                              <p className={"m-0"}>
                                Thank You for choosing! Stonedboy@yahoo.com
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {stepNo == 1 && (
                <Row className={"gy-3"}>
                  <Col>
                    <label className="mb-2">
                      Wallet Address: (Bitcoin Newtork)
                    </label>

                    <div className={classes?.walletAddress}>
                      <p className="mb-0">
                        bc1qeajz668z4yrcgw3pt2ue2r6vz43fns277wt26s
                      </p>
                      <FaCopy
                        size={20}
                        color={"var(--blue-color)"}
                        onClick={() =>
                          copyToClipboard(
                            "bc1qeajz668z4yrcgw3pt2ue2r6vz43fns277wt26s"
                          )
                        }
                      />
                    </div>
                    <p className="mt-2 mb-0" style={{ fontWeight: 600 }}>
                      For other payment methods contact us on telegram
                      <SocialIcon
                        target={"_blank"}
                        url={"https://telegram.com"}
                        className={classes?.telegramIcon}
                        onClick={(a) => {
                          a?.preventDefault();
                          if (window) {
                            window?.open("https://t.me/stoned", "_blank");
                          }
                        }}
                      />
                    </p>
                  </Col>
                  <Col md={12}>
                    <Input
                      label={"Transaction ID"}
                      placeholder={"Enter transaction Id here"}
                      value={transactionId}
                      setter={setTransactionId}
                      labelColor={"var(--text-black-color)"}
                    />
                  </Col>
                  <Col md={12}>
                    <UploadImageBox
                      state={proof}
                      setter={setProof}
                      labelColor={"var(--text-black-color)"}
                      variant={"web"}
                      label={"Payment Proof"}
                    />
                  </Col>
                </Row>
              )}
              {stepNo == 2 && (
                <>
                  <Row>
                    <Col md={12}>
                      <h3 className="text-white">Payment Successful</h3>
                    </Col>

                    <Col md={12} className={classes?.content}>
                      <div className={classes?.checkIcon}>
                        <FaCheck size={90} color={"var(--white-color)"} />
                      </div>
                      <p className="text-center mt-4">
                        Estimated Delivery Time {data?.estimateDays} Days...
                      </p>
                    </Col>
                  </Row>
                </>
              )}
              {cart?.length > 0 && (
                <>
                  <div className="jCenter mt-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!accessToken) {
                          return router.push("/login");
                        }
                        handleSubmit();
                      }}
                      disabled={isApiCalling}
                    >
                      {!accessToken
                        ? "Login"
                        : stepNo == 0
                        ? "Next"
                        : stepNo == 1
                        ? isApiCalling
                          ? "Submitting..."
                          : "Submit"
                        : "Home"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Container>
        </section>
      </div>
    </Loader>
  );
}
