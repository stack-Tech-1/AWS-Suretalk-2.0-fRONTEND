import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

export default function TierSelector({ tiers, selectedTier, onSelect, className = "" }) {
  return (
    <div className={`grid md:grid-cols-3 gap-6 ${className}`}>
      {tiers.map((tier) => (
        <motion.div
          key={tier.id}
          whileHover={{ y: -5 }}
          onClick={() => onSelect(tier.id)}
          className={`relative p-6 rounded-xl border-2 cursor-pointer 
                    transition-all duration-200 ${
            selectedTier === tier.id
              ? 'border-brand-500 shadow-lg scale-[1.02] ring-2 ring-brand-500/20'
              : 'border-gray-200 hover:border-gray-300'
          } ${tier.highlighted ? 'ring-2 ring-purple-200' : ''}`}
        >
          {tier.highlighted && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                             px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 
                          ${tier.color === 'blue' ? 'badge-lite' : 
                            tier.color === 'purple' ? 'bg-purple-100 text-purple-800' : 
                            'badge-premium'}`}>
              {tier.name}
            </div>
            
            <div className="mb-2">
              <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
              {tier.period !== 'forever' && (
                <span className="text-gray-600 ml-1 text-sm">{tier.period}</span>
              )}
            </div>
            <p className="text-sm text-gray-600">{tier.description}</p>
          </div>

          <ul className="space-y-3 mb-6">
            {tier.features.map((feature, idx) => (
              <li key={idx} className="flex items-start text-sm">
                <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <div className={`text-center p-3 rounded-lg font-medium transition-colors ${
            selectedTier === tier.id
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            {selectedTier === tier.id ? (
              <span className="flex items-center justify-center">
                <Check className="w-4 h-4 mr-2" />
                Selected
              </span>
            ) : (
              "Select Plan"
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}