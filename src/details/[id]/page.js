import Carousel from "@/components/carousel";
import HeroSection from "@/components/HeroSection";
import LightBox from "@/components/LightBox";
import Loader from "@/components/Loader";
import { BaseURL, imageUrl } from "@/config/apiUrl";
import Image from "next/image";
import { Col, Container, Row } from "react-bootstrap";
import AddToCart from "./add-to-cart";
import classes from "./productDetail.module.css";

const getAllData = async (id) => {
  const url = `products/${id}`;
  const apiResponse = await fetch(BaseURL(url), {
    method: "GET",
    cache: "no-store",
  });
  if (!apiResponse?.ok) {
    return notFound();
  }
  const res = await apiResponse.json();

  return res?.data;
};

async function ProductDetail({ params }) {
  const id = params?.id;
  const data = (await getAllData(id)) ?? null;

  return (
    <Loader showWeb={true}>
      <main className={classes.main}>
        <style>{`.rec-slider-container{
        margin:0px;
      }`}</style>
        <HeroSection showBg={false} className={classes.hero}>
          <Carousel
            verticalMode={false}
            breakPoints={[
              { width: 1, itemsToShow: 1, pagination: true },
              { width: 550, pagination: false, showArrows: true },
            ]}
          >
            {data?.images?.map((a) => (
              <div className={classes?.caroImage} key={a}>
                <LightBox
                  images={data?.images?.map((a) => ({ src: imageUrl(a) }))}
                >
                  <Image
                    src={imageUrl(a)}
                    alt={a}
                    fill
                    unoptimized={a?.endsWith(".gif")}
                    fetchPriority
                  />
                </LightBox>
              </div>
            ))}
          </Carousel>
        </HeroSection>
        <section className={classes?.detailSection}>
          <Container>
            <Row className="gy-3">
              <Col md={12}>
                <h1>${data?.price}</h1>
                <h2>{data?.name}</h2>
              </Col>
              <Col md={6} className={classes?.labelValue}>
                <label>Category:&nbsp;</label>
                <p>{`${data?.category?.name}`}</p>
              </Col>
              <Col md={6} className={classes?.labelValue}>
                <label>Estimated Delivery Days:&nbsp;</label>
                <p>{`${data?.deliveryDays}`}</p>
              </Col>

              <Col md={12} className={classes?.labelValue}>
                <label>Description:&nbsp;</label>
                <p className={classes?.desc}>{`${data?.description} `}</p>
              </Col>
              <Col md={12} className={"jCenter mt-2"}>
                <AddToCart item={data} />
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </Loader>
  );
}

export default ProductDetail;
