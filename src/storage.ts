import { useState } from "react";
import { MovieItemModel } from "./api";

export const WISH_LIST_STORAGE = "WISH_LIST_STORAGE";

export const getWishListStorage = () => {
  const wishListLocal = localStorage.getItem(WISH_LIST_STORAGE);
  const wishlist: MovieItemModel[] = wishListLocal
    ? JSON.parse(wishListLocal)
    : [];

  return wishlist;
};

export const addToWishListStorage = (movie: MovieItemModel) => {
  const wishlist: MovieItemModel[] = getWishListStorage();
  wishlist.push(movie);
  localStorage.setItem(WISH_LIST_STORAGE, JSON.stringify(wishlist));
};

export const removeFromWishListStorage = (movie: MovieItemModel) => {
  const wishlist: MovieItemModel[] = getWishListStorage();
  const newList = wishlist.filter((item) => item.id != movie.id);
  localStorage.setItem(WISH_LIST_STORAGE, JSON.stringify(newList));
};

export const isInWishListStorage = (movie: MovieItemModel) => {
  const wishlist: MovieItemModel[] = getWishListStorage();
  if (wishlist.filter((ele) => ele.id == movie.id).length > 0) {
    return true;
  }

  return false;
};
