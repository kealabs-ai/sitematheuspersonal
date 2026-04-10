import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import LinkBio from './LinkBio.jsx';
import Cart from './Cart.jsx';
import Register from './Register.jsx';
import Checkout from './Checkout.jsx';
import Confirmation from './Confirmation.jsx';
import Terms from './Terms.jsx';
import Privacy from './Privacy.jsx';
import Feedback from './Feedback.jsx';
import Dashboard from './Dashboard.jsx';
import Treinos from './Treinos.jsx';
import Evolucao from './Evolucao.jsx';
import Nutricao from './Nutricao.jsx';
import Perfil from './Perfil.jsx';
import NotFound from './NotFound.jsx';
import Admin from './Admin.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bio" element={<LinkBio />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/feedbacks" element={<Feedback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/treinos" element={<Treinos />} />
        <Route path="/dashboard/evolucao" element={<Evolucao />} />
        <Route path="/dashboard/nutricao" element={<Nutricao />} />
        <Route path="/dashboard/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
