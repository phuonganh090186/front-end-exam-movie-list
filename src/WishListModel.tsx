import {
  Box,
  Stack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RiInboxLine } from "react-icons/ri";
import { MovieItemModel } from "./api";
import Movie from "./Movie";
import { getWishListStorage } from "./storage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

const WishlistModel = ({ isOpen, onClose }: Props) => {
  const [wishList, setWishList] = useState<MovieItemModel[]>([]);

  useEffect(() => {
    if (isOpen) {
      const wishlistStorage = getWishListStorage();
      setWishList(wishlistStorage);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bgColor="#f3f3f3">
        <ModalHeader>Wishlist</ModalHeader>
        <ModalCloseButton />
        <ModalBody p="32px">
          {/* ----- Empty UI ----- */}
          <Center py="32px" color="pink.600" flexDirection="column">
            <Box fontSize="x-large" mb="8px">
              <RiInboxLine />
            </Box>
            Find your favorite movies!
            <Button
              mt="16px"
              size="md"
              variant="outline"
              colorScheme="blackAlpha"
              onClick={onClose}
            >
              Close
            </Button>
          </Center>

          {/* ----- Movie List ------ */}
          <Stack>
            {wishList.map((item) => (
              <Movie
                key={item.id}
                item={item}
              />
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WishlistModel;
