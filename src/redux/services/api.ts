import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Category', 'Product', 'Banner', 'Order', 'Analytics', 'Auth', 'Message'],
  endpoints: (builder) => ({
    // Auth Endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    // Category Endpoints
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (category) => ({
        url: '/categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category', 'Product'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => {
        const body = data.body !== undefined ? data.body : data;
        return {
          url: `/categories/${id}`,
          method: 'PATCH',
          body,
        };
      },
      invalidatesTags: ['Category', 'Product'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category', 'Product'],
    }),

    // Product Endpoints
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
        // FormData headers are set automatically by the browser, including the boundary,
        // so we don't set Content-Type: multipart/form-data manually in fetchBaseQuery.
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),
    addProductImages: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProductImage: builder.mutation({
      query: ({ productId, imageId }) => ({
        url: `/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),

    // Banner Endpoints
    getBanners: builder.query({
      query: () => '/banners',
      providesTags: ['Banner'],
    }),
    getAllBanners: builder.query({
      query: () => '/banners/all',
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation({
      query: (formData) => ({
        url: '/banners',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/banners/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),

    // Order Endpoints
    createOrder: builder.mutation({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order', 'Product', 'Analytics'],
    }),
    getOrders: builder.query({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order', 'Analytics', 'Product'],
    }),
    updateOrderPayment: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/payment`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order', 'Analytics'],
    }),
    updateOrderCid: builder.mutation({
      query: ({ id, cidNumber }) => ({
        url: `/orders/${id}/cid`,
        method: 'PATCH',
        body: { cidNumber },
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderDeliveryCharge: builder.mutation({
      query: ({ id, deliveryCharge }) => ({
        url: `/orders/${id}/delivery-charge`,
        method: 'PATCH',
        body: { deliveryCharge },
      }),
      invalidatesTags: ['Order', 'Analytics'],
    }),

    // Analytics Endpoints
    getSummary: builder.query({
      query: () => '/analytics/summary',
      providesTags: ['Analytics'],
    }),
    getOrdersByStatus: builder.query({
      query: () => '/analytics/orders-by-status',
      providesTags: ['Analytics'],
    }),
    getRevenueOverTime: builder.query({
      query: (params) => ({
        url: '/analytics/revenue-over-time',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    getTopProducts: builder.query({
      query: () => '/analytics/top-products',
      providesTags: ['Analytics'],
    }),
    getLowStock: builder.query({
      query: (params) => ({
        url: '/analytics/low-stock',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Message Endpoints
    getMessages: builder.query({
      query: () => '/messages',
      providesTags: ['Message'],
    }),
    createMessage: builder.mutation({
      query: (message) => ({
        url: '/messages',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),
    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useAddProductImagesMutation,
  useDeleteProductImageMutation,
  useDeleteProductMutation,
  useGetBannersQuery,
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentMutation,
  useUpdateOrderCidMutation,
  useUpdateOrderDeliveryChargeMutation,
  useGetSummaryQuery,
  useGetOrdersByStatusQuery,
  useGetRevenueOverTimeQuery,
  useGetTopProductsQuery,
  useGetLowStockQuery,
  useGetMessagesQuery,
  useCreateMessageMutation,
  useDeleteMessageMutation,
} = api;
