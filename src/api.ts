import axios, { AxiosError, AxiosRequestConfig, CancelToken } from "axios";
import { isInWishListStorage } from "./storage";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_TIME_OUT = 50000;
const API_KEY = "ba9e9eb1cba46fa2c366ab90f70a5dbe";
const MOVIE_POPULAR_API_URL = `${API_BASE_URL}/movie/popular`;
const MOVIE_SEARCH_API_URL = `${API_BASE_URL}/search/movie`;

export const API_RESULT_ERROR = "Error";

const baseAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIME_OUT,
});

export interface MovieItemModel {
  adult?: boolean;
  backdrop_path?: string;
  genre_ids?: number[];
  id?: number;
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  release_date?: string;
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  isWish?: boolean;
}
export interface MovieDataModel {
  page?: number;
  results?: MovieItemModel[];
  total_pages?: number;
  total_results?: number;
}

const request = async <T = any>(
  url: string,
  config: AxiosRequestConfig
): Promise<T | null> => {
  let result = null;
  try {
    config.baseURL = API_BASE_URL;
    config.timeout = API_TIME_OUT;
    config.params = { ...config.params, api_key: API_KEY };
    result = (await baseAxios(config)).data;
  } catch (error: any) {
    result = API_RESULT_ERROR;
  }

  return result;
};

const api = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T | null> => {
    return request(url, { method: "get", url, ...config });
  },
};

export const getMoviePopularList = async (
  cancelToken: CancelToken,
  params?: { page: number }
) => {
  const data = await api.get<MovieDataModel | string>(MOVIE_POPULAR_API_URL, {
    params,
    cancelToken,
  });

  (data as MovieDataModel).results?.forEach((item) => {
    item.isWish = isInWishListStorage(item);
  });

  return data ? data : ({} as MovieDataModel);
};

export const getMovieSearchList = async (
  cancelToken: CancelToken,
  params: { query: string; page: number }
) => {
  const data = await api.get<MovieDataModel | string>(MOVIE_SEARCH_API_URL, {
    params,
    cancelToken,
  });
  (data as MovieDataModel).results?.forEach((item) => {
    item.isWish = isInWishListStorage(item);
  });

  return data ? data : ({} as MovieDataModel);
};
