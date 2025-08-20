import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import { staticReviews } from '../types';

interface ReviewsTabProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
}

const ReviewsTab = React.memo(({ userProfile, currentUser }: ReviewsTabProps) => {
  const reviewsData = userProfile?.reviews || staticReviews;

  return (
    <div>
      {reviewsData.length > 0 ? (
        <div className="space-y-6">
          {reviewsData.map(review => (
            <Card key={review.id} className="border-l-4 border-[--color-primary]/50">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[--color-bg-secondary] flex items-center justify-center font-bold text-[--color-text-secondary] mr-4">
                    {review.client.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[--color-text-primary]">{review.client}</h4>
                        <p className="text-sm text-[--color-text-secondary]">{review.project}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={`${
                              i < review.rating 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-[--color-border]'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-[--color-text-secondary] italic">"{review.comment}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[--color-text-secondary]">No reviews to display.</p>
        </div>
      )}
    </div>
  );
});

ReviewsTab.displayName = 'ReviewsTab';

export default ReviewsTab;
