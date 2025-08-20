import React from 'react';
import { Wallet, Coins } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface BalanceCardProps {
  icon: React.ElementType;
  title: string;
  amount: string;
  description: string;
  cta: string;
}

const BalanceCard = React.memo(({ icon: Icon, title, amount, description, cta }: BalanceCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4 pt-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[--color-text-secondary]">{title}</p>
          <p className="text-2xl font-bold text-[--color-text-primary] mt-1">{amount}</p>
          <p className="text-xs text-[--color-text-secondary] mt-1">{description}</p>
        </div>
        <Icon className="w-6 h-6 text-[--color-text-secondary]/70"/>
      </div>
      <Button variant="link" className="p-0 h-auto mt-2 text-sm">
        {cta}
      </Button>
    </CardContent>
  </Card>
));

BalanceCard.displayName = 'BalanceCard';

const ProfileBalanceCards = React.memo(() => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <BalanceCard 
        icon={Wallet} 
        title="Wallet Balance" 
        amount="$1,234.56" 
        description="+20.1% last month" 
        cta="Withdraw"
      />
      <BalanceCard 
        icon={Coins} 
        title="FOG Coins" 
        amount="12,500 FOG" 
        description="≈ $1,250.00" 
        cta="Top Up"
      />
    </div>
  );
});

ProfileBalanceCards.displayName = 'ProfileBalanceCards';

export default ProfileBalanceCards;
