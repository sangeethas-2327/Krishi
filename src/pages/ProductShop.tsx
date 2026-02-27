import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const products = [
  { name: 'Neem Oil (500ml)', price: 299, rating: 4.5, tag: 'AI Recommended', img: '🌿' },
  { name: 'Cocopeat Block (5kg)', price: 450, rating: 4.7, tag: 'Bestseller', img: '🥥' },
  { name: 'Vermicompost (10kg)', price: 350, rating: 4.8, tag: 'Organic', img: '🪱' },
  { name: 'Drip Irrigation Kit', price: 1200, rating: 4.3, tag: 'Popular', img: '💧' },
  { name: 'Seaweed Extract (1L)', price: 550, rating: 4.6, tag: 'AI Recommended', img: '🌊' },
  { name: 'Garden Tool Set', price: 899, rating: 4.4, tag: '', img: '🛠' },
];

export default function ProductShop() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Product Shop 🛒</h1>
        <p className="text-muted-foreground mb-6">Organic gardening supplies with AI recommendations</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-warm transition-shadow">
              <div className="h-32 gradient-card flex items-center justify-center text-5xl">{p.img}</div>
              <div className="p-4">
                {p.tag && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.tag}</span>}
                <h3 className="font-semibold mt-2">{p.name}</h3>
                <div className="flex items-center gap-1 text-xs text-secondary mt-1"><Star className="w-3 h-3 fill-secondary" />{p.rating}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-heading font-bold text-lg">₹{p.price}</span>
                  <Button size="sm" className="gradient-primary text-primary-foreground"><ShoppingCart className="w-3 h-3 mr-1" />Add</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
