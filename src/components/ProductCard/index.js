"use client";
import { imageUrl } from "@/config/apiUrl";
import { addToCart, deleteProductFromCart } from "@/store/auth/authSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCart3, BsCartFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "../Button";
import classes from "./ProductCard.module.css";

let clickOnCart = false;

function ProductCard({ item }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state?.authReducer?.cart);

  const addProductInCart = () => {
    clickOnCart = true;
    const newCart = [...cart];
    if (newCart?.find((e) => e?.product?._id == item?._id)) {
      const itemIndex = newCart?.findIndex((e) => e?.product?._id == item?._id);
      dispatch(deleteProductFromCart(itemIndex));
      toast.success("Product removed from the cart successfully");
    } else {
      const data = {
        product: item,
        quantity: 1,
      };
      dispatch(addToCart(data));
      toast.success("Product added in the cart successfully");
    }
    setTimeout(() => {
      clickOnCart = false;
    }, 50);
  };

  return (
    <div
      className={classes?.card}
      onClick={() => {
        !clickOnCart && router.push(`/details/${item?._id}`);
      }}
    >
      <div className={classes?.imgDiv}>
        <Image
          src={imageUrl(item?.images?.[0])}
          alt={item?.title}
          fill
          unoptimized={item?.images?.[0]?.endsWith(".gif")}
          fetchPriority
        />
        <div className={classes?.labelCont}>
          <div className={classes?.price}>
            <span>${item?.price}</span>
          </div>
        </div>
      </div>
      <div className={classes?.details}>
        <h5 className="Line1">{item?.name}</h5>
        <p className="Line1">{item?.description}</p>

        <Button
          onClick={(e) => {
            e?.stopPropagation();
            addProductInCart();
          }}
        >
          {cart?.find((e) => e?.product?._id == item?._id) ? (
            <span>
              <BsCartFill size={15} /> Remove from Cart
            </span>
          ) : (
            <span>
              <BsCart3 size={15} /> Add to Cart
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default ProductCard;
