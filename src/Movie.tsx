import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";
import { MovieItemModel } from "./api";
import {
  addToWishListStorage,
  getWishListStorage,
  removeFromWishListStorage,
} from "./storage";
import { useSelector } from "react-redux";
import { RootState } from "./store";

const Movie = ({ item, onChangeWish }: { item: MovieItemModel; onChangeWish?: (isWish: boolean) => void }) => {
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);
  const localStorageChangeTime = useSelector((state: RootState) => state.app.localStorageChangeTime);

  useEffect(() => {
    const wishlist = getWishListStorage();
    if (wishlist.filter((ele) => ele.id == item.id).length > 0) {
      setIsAddedToWishlist(true);
    }
    else {
      setIsAddedToWishlist(false);
    }
  }, [localStorageChangeTime]);

  const onToogleWish = () => {
    const wishState = !isAddedToWishlist;
    setIsAddedToWishlist(wishState);
    if (wishState) {
      addToWishListStorage(item);
    } else {
      removeFromWishListStorage(item);
    }
    onChangeWish?.(wishState);
  };

  return (
    <Flex
      w="full"
      px="24px"
      py="16px"
      bgColor="white"
      borderRadius="md"
      justify="space-between"
      align="center"
      boxShadow="sm"
    >
      <Box>
        <Text fontWeight="semibold">{item.title ?? ""}</Text>
        <Text color="gray.400" fontSize="xs" isTruncated>
          {new Date(item.release_date ?? "").getFullYear()}
        </Text>
      </Box>
      <IconButton
        variant="ghost"
        colorScheme="pink"
        icon={isAddedToWishlist ? <RiHeartFill /> : <RiHeartLine />}
        aria-label="edit"
        _focus={{ outline: "none" }}
        isRound
        onClick={onToogleWish}
      />
    </Flex>
  );
};

export default Movie;
