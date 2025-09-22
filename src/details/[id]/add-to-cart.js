"use client";
import Button from "@/components/Button";
import { addToCart, deleteProductFromCart } from "@/store/auth/authSlice";
import { BsCart3, BsCartFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

function AddToCart({ item }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state?.authReducer?.cart);

  const addProductInCart = (e) => {
    e?.stopPropagation();
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
  };

  return (
    <Button onClick={addProductInCart}>
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
  );
}

export default AddToCart;
