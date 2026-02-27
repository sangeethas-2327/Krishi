import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LeafScanner from "./pages/LeafScanner";
import PlantClassification from "./pages/PlantClassification";
import AIAssistant from "./pages/AIAssistant";
import IoTSensors from "./pages/IoTSensors";
import FieldMap from "./pages/FieldMap";
import TreatmentPlans from "./pages/TreatmentPlans";
import SpraySchedule from "./pages/SpraySchedule";
import YieldAnalytics from "./pages/YieldAnalytics";
import MarketPrices from "./pages/MarketPrices";
import Weather from "./pages/Weather";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import KVKSupport from "./pages/KVKSupport";
import CareCalendar from "./pages/CareCalendar";
import SoilTracker from "./pages/SoilTracker";
import SunlightPlanner from "./pages/SunlightPlanner";
import Community from "./pages/Community";
import ProductShop from "./pages/ProductShop";
import PlantDiary from "./pages/PlantDiary";
import DiseaseLibrary from "./pages/DiseaseLibrary";
import Learning from "./pages/Learning";
import VirtualLab from "./pages/VirtualLab";
import Quizzes from "./pages/Quizzes";
import Assignments from "./pages/Assignments";
import Leaderboard from "./pages/Leaderboard";
import MyProgress from "./pages/MyProgress";
import ResearchFeed from "./pages/ResearchFeed";
import ReviewQueue from "./pages/ReviewQueue";
import ModelPerformance from "./pages/ModelPerformance";
import DatasetManager from "./pages/DatasetManager";
import Retraining from "./pages/Retraining";
import KnowledgeBase from "./pages/KnowledgeBase";
import ExpertNetwork from "./pages/ExpertNetwork";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Shared */}
              <Route path="/dashboard/leaf-scanner" element={<LeafScanner />} />
              <Route path="/dashboard/plant-classification" element={<PlantClassification />} />
              <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
              {/* Farmer */}
              <Route path="/dashboard/iot-sensors" element={<IoTSensors />} />
              <Route path="/dashboard/field-map" element={<FieldMap />} />
              <Route path="/dashboard/treatment-plans" element={<TreatmentPlans />} />
              <Route path="/dashboard/spray-schedule" element={<SpraySchedule />} />
              <Route path="/dashboard/yield-analytics" element={<YieldAnalytics />} />
              <Route path="/dashboard/market-prices" element={<MarketPrices />} />
              <Route path="/dashboard/weather" element={<Weather />} />
              <Route path="/dashboard/government-schemes" element={<GovernmentSchemes />} />
              <Route path="/dashboard/kvk-support" element={<KVKSupport />} />
              {/* Gardener */}
              <Route path="/dashboard/care-calendar" element={<CareCalendar />} />
              <Route path="/dashboard/soil-tracker" element={<SoilTracker />} />
              <Route path="/dashboard/sunlight-planner" element={<SunlightPlanner />} />
              <Route path="/dashboard/community" element={<Community />} />
              <Route path="/dashboard/product-shop" element={<ProductShop />} />
              <Route path="/dashboard/plant-diary" element={<PlantDiary />} />
              <Route path="/dashboard/disease-library" element={<DiseaseLibrary />} />
              {/* Student */}
              <Route path="/dashboard/learning" element={<Learning />} />
              <Route path="/dashboard/virtual-lab" element={<VirtualLab />} />
              <Route path="/dashboard/quizzes" element={<Quizzes />} />
              <Route path="/dashboard/assignments" element={<Assignments />} />
              <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
              <Route path="/dashboard/my-progress" element={<MyProgress />} />
              <Route path="/dashboard/research-feed" element={<ResearchFeed />} />
              {/* Expert */}
              <Route path="/dashboard/review-queue" element={<ReviewQueue />} />
              <Route path="/dashboard/model-performance" element={<ModelPerformance />} />
              <Route path="/dashboard/dataset-manager" element={<DatasetManager />} />
              <Route path="/dashboard/retraining" element={<Retraining />} />
              <Route path="/dashboard/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/dashboard/expert-network" element={<ExpertNetwork />} />
              <Route path="/dashboard/platform-analytics" element={<PlatformAnalytics />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
