import { configureStore } from "@reduxjs/toolkit";
import registerReducer from "../features/auth/registerSlice";
import loginReducer from "../features/auth/loginSlice";
import userReducer from "../features/auth/userSlice";
import productReducer from "../features/products/productSlice";
// import purchaseReducer from "../features/purchases/purchaseSlice";

const store = configureStore({
  reducer: {
    register: registerReducer,
    login: loginReducer,
    user: userReducer,
    products: productReducer,
    //  purchases: purchaseReducer, 
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
  devTools: import.meta.env.MODE !== "production"


});

export default store;   // ✅ default export
