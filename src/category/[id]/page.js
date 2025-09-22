import Carousel from "@/components/carousel";
import CategoryAndProducts from "@/components/CategoryAndProducts";
import HeroSection from "@/components/HeroSection";
import LightBox from "@/components/LightBox";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData/NoData";
import PaginationComponent from "@/components/PaginationComponent";
import ProductCard from "@/components/ProductCard";
import { BaseURL, imageUrl, recordsLimit } from "@/config/apiUrl";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Col, Container, Row } from "react-bootstrap";
import classes from "./CategoryDetail.module.css";

const getAllData = async (pageNo = 1, category = "all") => {
  const url =
    category == "all"
      ? `products?page=${pageNo}&limit=${recordsLimit}`
      : `products/group?categoryId=${category}&page=${pageNo}&limit=${recordsLimit}`;
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

const getAllCats = async () => {
  const apiResponse = await fetch(BaseURL(`category`), {
    method: "GET",
    cache: "no-store",
  });
  const res = await apiResponse.json();
  return res?.data?.categories;
};

async function CategoryDetail({ params, searchParams }) {
  const query = new URLSearchParams(searchParams);
  const tabValue = params?.id;
  const page = query.get("page") ?? 1;
  const catsData = (await getAllCats()) ?? [];
  const { products = [], totalCount = 0 } = await getAllData(page, tabValue);
  const allCatsData = [...catsData];

  const data = allCatsData?.find((e) => e?._id == tabValue);

  return (
    <Loader showWeb={true}>
      <main className={classes.main}>
        <style>{`.rec-slider-container{
        margin:0px;
      }`}</style>

        <HeroSection showBg={false} className={classes?.hero}>
          <div className={classes?.heroDiv}>
            <Carousel
              enableAutoPlay={false}
              verticalMode={false}
              showArrows={false}
              swipeable={false}
            >
              <div className={classes?.slide}>
                <LightBox images={[{ src: imageUrl(data?.image) }]}>
                  <Image
                    src={imageUrl(data?.image)}
                    fill
                    alt={data?.name}
                    unoptimized={data?.image?.endsWith(".gif")}
                    fetchPriority
                  />
                </LightBox>
              </div>
            </Carousel>
          </div>
        </HeroSection>
        <section className={classes?.detailSection}>
          <Container>
            <Row className="gy-3">
              <Col md={12}>
                <h2>{data?.name}</h2>
              </Col>
              <Col md={12} className={classes?.labelValue}>
                <p className={classes?.desc}>{`${data?.description} `}</p>
              </Col>
              <Col md={12} className={"jCenter mt-2"}></Col>
            </Row>
            <CategoryAndProducts
              categories={allCatsData}
              products={products}
              tabValue={tabValue}
              tabSelectedTextColor={"var(--white-color)"}
              tabTextColor={"var(--white-color)"}
            />

            <Row className="gy-4">
              {products?.length == 0 ? (
                <NoData
                  text={"No Products Found"}
                  color={"var(--white-color)"}
                />
              ) : (
                products?.map((item, key) => (
                  <Col md={4} key={key}>
                    <ProductCard item={item} />
                  </Col>
                ))
              )}
            </Row>
          </Container>

          {products?.length > 0 && (
            <div className={classes?.paginationDiv}>
              <PaginationComponent
                currentPage={page}
                totalPages={Math.ceil(totalCount / recordsLimit)}
                path={`/category/${tabValue}?${query?.toString()}`}
              />
            </div>
          )}
        </section>
      </main>
    </Loader>
  );
}

export default CategoryDetail;
