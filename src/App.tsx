import {
  Box,
  Flex,
  Heading,
  Stack,
  Button,
  useDisclosure,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Spinner,
  Center,
} from "@chakra-ui/react";
import axios, { CancelTokenSource } from "axios";
import { useEffect, useRef, useState } from "react";
import {
  RiAlertLine,
  RiArrowUpLine,
  RiFileList3Line,
  RiFireFill,
  RiHeartLine,
  RiInboxLine,
  RiSearchLine,
} from "react-icons/ri";
import {
  API_RESULT_ERROR,
  getMoviePopularList,
  getMovieSearchList,
  MovieItemModel,
  MovieDataModel,
} from "./api";
import Movie from "./Movie";
import WishlistModel from "./WishListModel";

/*
## 需求：
  - 電影列表：
    - 透過 API 取得電影資料，並顯示在畫面上
      - 資料來源：https://developers.themoviedb.org
      - API key：`ba9e9eb1cba46fa2c366ab90f70a5dbe` 
    - 當搜尋關鍵字為空值時，顯示熱門電影列表（Movie List UI）
      - API 文件：https://developers.themoviedb.org/3/movies/get-popular-movies
      - 預設顯示前 20 筆資料
    - 尚未載入資料前，顯示 Loading 畫面（Loading UI）
    - 若載入資料失敗，則需顯示 Error 畫面（Error UI）
    - 若沒有任何資料時，則顯示 Empty 畫面（Empty UI）
  - 完成 `Movie` component
    - 需顯示 `電影名稱`、`電影年份` 及 `加入願望清單` 按鈕（愛心符號的按鈕）
    - 按下 `加入願望清單` 按鈕後，會將該電影加入願望清單，且愛心符號變為實心
    - 再次按下 `加入願望清單` 按鈕後，會將該電影從願望清單中移除，且愛心符號會變為空心
    - 在網頁重新整理後，願望清單的內容仍須保留
  - 搜尋電影
    - API 文件：https://developers.themoviedb.org/3/search/search-movies
    - 可以在搜尋欄中輸入關鍵字查詢電影，同時將搜尋結果顯示在下方列表（Search Result UI）
    - 預設顯示前 20 筆搜尋結果
    - 沒有任何符合關鍵字的電影時，請顯示無搜尋結果畫面（Empty Search Result UI）
  - 願望清單
    - 點擊右上角的 `Wishlist` 按鈕可以打開願望清單
    - 清單中會顯示所有已加入願望清單的電影
    - 點擊任一電影的 `加入願望清單` 按鈕，即可將該電影從願望清單中移除
## 加分項目
  - 實作 Lazy load
    - 完成 `載入更多` 按鈕（Load More Button UI）
      - 當熱門電影或搜尋結果超過 20 筆資料時，請顯示 `載入更多` 按鈕在電影列表或搜尋結果的最下方
      - 點擊按鈕後會載入後 20 筆資料
      - 載入後續資料期間，按鈕須顯示為 Loading 狀態
      - 若所有資料皆已顯示完畢，此按鈕隨即消失
    - 完成 `回到頂部` 按鈕（GO to Top Button UI）
      - 按下按鈕時會向上捲動至熱門電影列表或搜尋結果列表的頂部
  - 重構 components
----------------
## Requirements:
  - Movie List
    - Render movie data
      - Data source: https://developers.themoviedb.org
      - API key：`ba9e9eb1cba46fa2c366ab90f70a5dbe` 
    - Show popular movies as default (without search keywords)
      - API document：https://developers.themoviedb.org/3/movies/get-popular-movies
      - Show top 20 records
    - Show loading UI before retrieving data from API
    - Show error UI if failed to retrieve data
    - Show empty UI if there isn't any data in the list
  - Complete the "Movie" component
    - Show "Title", "Production Year" and "Add to Wishlist" button (a heart icon button)
    - When user clicked on the heart icon button, the movie will be added to user's wishlist and the heart icon will become solid
    - If user clicked on a solid heart icon button, the movie will be removed from the wishlist
    - The movies in the wishlist will remain after user refreshed the page
  - Search movie
    - API document：https://developers.themoviedb.org/3/search/search-movies
    - User can search movies by entering keywords in the input field, the result will replace the original data in the movie list
    - Show top 20 records
    - Show empty result UI if there is no mated result
  - Wishlist
    - Clicking the "Wishlist" button on the top-right will open the wishlist modal
    - The list will display all movies that was added to the wishlist by the user
    - Clicking on the solid heart icon button on the movie will remove the corresponding movie from the wishlist
## Bonus
  - Lazy load
    - Implement "Load More" button
      - When Popular Movies or search results has more than 20 records, please show the “Load More” button at the bottom of the movie list or search result
      - Load 20 records after the Load More button is clicked
      - While loading the records, show Load More button in Loading state
      - If all records are fully displayed, the Load More button will disappear
    - Implement "Back to Top" button
      - Page will automatically scroll to top of the Popular Movies list or search result list after clicking the button
  - Refactor components
*/

const cts: CancelTokenSource | null = axios.CancelToken.source();

interface AppState {
  loadPage: number;
  isSearch: boolean;
  searchKey: string;
  totalResult: number;
  movieList: MovieItemModel[] | null;
}

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>({
    loadPage: 1,
    isSearch: false,
    searchKey: "",
    totalResult: 0,
    movieList: [],
  });
  const moiveListref = useRef<HTMLDivElement>(null);
  const movieList = appState.movieList;
  const isSearch = appState.isSearch;

  const updateData = (
    isLoadMore: boolean,
    data: MovieDataModel | string,
    page: number,
    isSearch = false,
    searchKey = ""
  ) => {
    //fail
    if (data == API_RESULT_ERROR) {
      setAppState({
        ...appState,
        movieList: null,
      });
    }
    //success
    else {
      if (isLoadMore) {
        const dataList =
          (data as MovieDataModel).results ?? ([] as MovieItemModel[]);
        const currList = appState.movieList ?? ([] as MovieItemModel[]);
        const moreList = [...currList, ...dataList];
        setAppState({
          ...appState,
          loadPage: page,
          movieList: moreList,
        });
      } else {
        setAppState({
          ...appState,
          isSearch: isSearch,
          searchKey: searchKey,
          loadPage: page,
          totalResult: (data as MovieDataModel).total_results ?? 0,
          movieList:
            (data as MovieDataModel).results ?? ([] as MovieItemModel[]),
        });
      }
    }
  };

  const getPopularData = (page: number, isLoadMore?: boolean) => {
    setIsLoading(true);
    getMoviePopularList(cts.token, { page }).then((data) => {
      updateData(isLoadMore ?? false, data, page);
      setIsLoading(false);
    });
  };

  const getSearchData = (
    page: number,
    searchKey: string,
    isLoadMore?: boolean
  ) => {
    setIsLoading(true);
    getMovieSearchList(cts.token, {
      query: searchKey,
      page: page,
    }).then((data) => {
      updateData(isLoadMore ?? false, data, page, true, searchKey);
      setIsLoading(false);
    });
  };

  const loadMore = () => {
    const loadMorePage = appState.loadPage + 1;
    if (appState.isSearch) {
      getSearchData(loadMorePage, appState.searchKey, true);
    } else {
      getPopularData(loadMorePage, true);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value == null || event.target.value == "") {
      setAppState({
        ...appState,
        isSearch: false,
      });
    } else {
      getSearchData(1, event.target.value, false);
    }
  };

  useEffect(() => {
    if (!isSearch) {
      getPopularData(1);
    }
  }, [isSearch]);

  return (
    <Box bgColor="#f3f3f3" h="100vh">
      <Flex w="full" h="full" px="32px" pt="64px" direction="column">
        <Flex w="full" mb="32px" justify="space-between" align="center">
          <Heading fontSize="24px">Movies</Heading>
          <Button
            size="md"
            colorScheme="pink"
            leftIcon={<RiHeartLine />}
            onClick={onOpen}
          >
            Wishlist
          </Button>
        </Flex>
        <InputGroup mb="16px">
          <InputLeftElement
            pointerEvents="none"
            color="gray.500"
            children={<RiSearchLine />}
          />
          <Input
            type="tel"
            placeholder="Search Movies"
            bg="white"
            onChange={(event) => handleSearch(event)}
          />
        </InputGroup>

        {/* ----- Loading UI ----- */}
        {isLoading && (
          <Center py="32px">
            <Spinner color="pink.600" />
          </Center>
        )}

        {/* ----- Error UI ----- */}
        {movieList == null && (
          <Center py="32px" color="pink.600" flexDirection="column">
            <Box fontSize="x-large" mb="8px">
              <RiAlertLine />
            </Box>
            <Box>Something went wrong.</Box>
            <Box>Please try again.</Box>
          </Center>
        )}

        {/* ----- Empty  UI ----- */}
        {movieList?.length == 0 && (
          <Center py="32px" color="pink.600" flexDirection="column">
            <Box fontSize="x-large" mb="8px">
              <RiInboxLine />
            </Box>
            {appState.isSearch ? " No matched result." : "No data."}
          </Center>
        )}

        {/* ----- Movie List (Popular/Search movies) ------ */}
        {(movieList?.length ?? 0) > 0 && (
          <Flex
            fontWeight="600"
            color="pink.600"
            mb="8px"
            align="center"
            gap="4px"
          >
            {appState.isSearch ? <RiFileList3Line /> : <RiFireFill />}
            {appState.isSearch ? "Search result" : "Popular movies"}
          </Flex>
        )}
        {(movieList?.length ?? 0) > 0 && (
          <Stack
            w="full"
            minH="0"
            pb="32px"
            flex={1}
            overflowY="auto"
            spacing="8px"
            ref={moiveListref}
          >
            {movieList?.map((item, index) => (
              <Movie key={item.id} item={item} />
            ))}

            {/* ----- Load More Button UI (Bonus) ------ */}
            {(movieList?.length ?? 0) < appState.totalResult && (
              <Center>
                <Button
                  variant="ghost"
                  size="md"
                  colorScheme="blackAlpha"
                  onClick={loadMore}
                  isLoading={isLoading} // set true while loading data
                  loadingText="Loading"
                >
                  Load More
                </Button>
              </Center>
            )}
          </Stack>
        )}
      </Flex>

      <WishlistModel isOpen={isOpen} onClose={onClose} />

      {/* ----- GO to Top Button UI (Bonus)  ------ */}
      {moiveListref.current != null && (
        <IconButton
          pos="absolute"
          right="16px"
          bottom="24px"
          colorScheme="pink"
          icon={<RiArrowUpLine />}
          aria-label="edit"
          _focus={{ outline: "none" }}
          isRound
          onClick={() => {
            moiveListref.current?.scrollTo(0, 0);
          }}
        />
      )}
    </Box>
  );
};

export default App;
