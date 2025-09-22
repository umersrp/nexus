"use client";
import { Get } from "@/Axios/AxiosFunctions";
import LightBox from "@/components/LightBox";
import Loader from "@/components/Loader";
import ShowMoreShowLessText from "@/components/ShowMoreShowLess/ShowMoreShowLessText";
import { BaseURL, imageUrl } from "@/config/apiUrl";
import { signOutRequest } from "@/store/auth/authSlice";
import moment from "moment";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Col, Container, ProgressBar, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import classes from "./detail.module.css";

const LabelWithField = ({ label, value }) => {
  return (
    <div className={classes?.itemContainer}>
      <p className={classes?.label}>
        {label}
        {":"}
      </p>
      <p className={classes?.value}>{value}</p>
    </div>
  );
};

const ProductInfoCard = ({ item, index }) => {
  return (
    <div className={`${classes?.main}`}>
      <div className={classes?.imageContainer}>
        <Image
          src={imageUrl(item?.product?.images?.[0])}
          fill
          alt={item?.name}
          unoptimized={item?.product?.images?.[0]?.endsWith(".gif")}
          fetchPriority
        />
      </div>
      <div>
        <h5>
          {!item?.product?.image && <>{++index}) </>}
          {item?.product?.title || item?.product?.name}
        </h5>
        <ShowMoreShowLessText
          text={item?.product?.description}
          visibility={100}
        />
        {item?.product?.status && (
          <p className="mt-2">{`Status: ${item?.product?.status}`}</p>
        )}
        <p className="mt-2">{`Price: $${item?.product?.price ?? 0}`}</p>
        <p className="mt-2">{`Quantity: ${item?.quantity}`}</p>
        <p className="mt-2">{`Total: $${item?.subTotal}`}</p>
      </div>
    </div>
  );
};
const MilestoneInfoCard = ({ item, index, onDelete }) => {
  return (
    <div className={`${classes?.main} ${classes?.milestonesCard}`}>
      <div>
        <h5>
          {<>{++index}) </>}
          {item?.title}
        </h5>
        <ShowMoreShowLessText text={item?.description} visibility={100} />
      </div>
      <div className={classes?.files}>
        <LightBox
          images={item?.images?.map((a, i) => ({ src: imageUrl(a), key: i }))}
        >
          {item?.images?.map((a, i) => (
            <div className={classes?.imageContainer} key={i}>
              <Image
                src={imageUrl(a)}
                fill
                alt={item?.title}
                unoptimized={a?.endsWith(".gif")}
                fetchPriority
              />
            </div>
          ))}
        </LightBox>
      </div>
      <p className="mt-2 text-end">{`Created At: ${moment(
        item?.createdAt
      ).format("DD MMM YYYY hh:mm a")}`}</p>
    </div>
  );
};

function OrderDetail() {
  const id = useParams()?.id;
  const { accessToken } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const getSingle = async () => {
    const url = BaseURL(`orders/details?id=${id}`);
    setLoading(true);
    const apiResponse = await Get(url, accessToken, true, () => {
      dispatch(signOutRequest());
      router.push("/login");
    });
    setLoading(false);

    if (apiResponse !== undefined) {
      let d = apiResponse?.data?.data;
      setData(d);
    }
  };

  useEffect(() => {
    getSingle();
  }, []);
  return (
    <Loader completeLoading={loading}>
      <div className={classes?.page}>
        <Container>
          <div className={classes?.mainContainer}>
            <Row className={"gy-4"}>
              <Col md={12}>
                <h2 className="text-white mb-0 text-center">Order Detail</h2>
              </Col>
              <Col md={12}>
                <div className={classes?.progressBox}>
                  <h5>Estimated Delivery Time</h5>
                  <h6>{data?.estimateDays} Days</h6>
                  <ProgressBar
                    striped
                    now={data?.progress}
                    className={"my-3"}
                    style={{ height: "30px" }}
                  />
                  {data?.milestones?.map((e, i) => (
                    <Col md={12} key={i}>
                      <MilestoneInfoCard item={e} index={i} />
                    </Col>
                  ))}
                  <p className="mt-3">
                    Thanks for Choosing Us! Your Delivery will be done in a few
                    days, We wish you the best.
                  </p>
                </div>
              </Col>
              <Col md={12}>
                <h4>Order Info</h4>
              </Col>
              <Col md={6}>
                <LabelWithField
                  label={"Total Products"}
                  value={data?.items?.length}
                />
              </Col>
              <Col md={6}>
                <LabelWithField
                  label={"Total Amount"}
                  value={`$${data?.total}`}
                />
              </Col>
              <Col md={6}>
                <LabelWithField label={"Status"} value={`${data?.status}`} />
              </Col>
              <Col md={6}>
                <LabelWithField
                  label={"Estimated Delivery Days"}
                  value={`${data?.estimateDays}`}
                />
              </Col>
              <Col md={6}>
                <LabelWithField
                  label={"Progress"}
                  value={`${data?.progress}%`}
                />
              </Col>
              <Col md={6}>
                <LabelWithField
                  label={"Created At"}
                  value={`${moment(data?.createdAt).format(
                    "DD MMM YYYY hh:mm"
                  )}`}
                />
              </Col>

              <Col md={12}>
                <h4>Transaction Info</h4>
              </Col>
              <Col md={12}>
                <LabelWithField
                  label={"Transaction ID"}
                  value={data?.transactionId}
                />
              </Col>
              <Col md={12}>
                <LabelWithField label={"Transaction Proof"} value={""} />
                <LightBox images={[{ src: imageUrl(data?.prove) }]}>
                  <div className={classes?.proveImg}>
                    <Image
                      src={imageUrl(data?.prove)}
                      fill
                      alt={data?.name}
                      unoptimized={data?.prove?.endsWith(".gif")}
                      fetchPriority
                    />
                  </div>
                </LightBox>
              </Col>

              <Col md={12}>
                <h4>Products Info</h4>
              </Col>
              {data?.items?.map((e, i) => (
                <Col md={12} key={i}>
                  <ProductInfoCard item={e} index={i} />
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </div>
    </Loader>
  );
}

export default OrderDetail;
