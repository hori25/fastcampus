import AudiophileSection from '@/components/AudiophileSection';
import CustomizeSection from '@/components/CustomizeSection';
import FeatureGrid from '@/components/FeatureGrid';
import LifestyleSection from '@/components/LifestyleSection';
import LunarBlueSection from '@/components/LunarBlueSection';
import QuietComfortSection from '@/components/QuietComfortSection';
import Scene3D from '@/components/Scene3D';
import WaitlistSection from '@/components/WaitlistSection';

export const metadata = {
  title: 'VibeX - Premium Audio Experience',
  description: 'Elevate your audio experience with VibeX premium headphones'
};

export default function ThreeDPage() {
  return (
    <main className="bg-black">
      <Scene3D />
      <CustomizeSection />
      <QuietComfortSection />
      <LifestyleSection />
      <AudiophileSection />
      <FeatureGrid />
      <LunarBlueSection />
      <WaitlistSection />
    </main>
  );
}

