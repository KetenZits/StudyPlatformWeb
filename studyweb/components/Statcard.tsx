import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import React from 'react';
import { Text, View } from "react-native";

const Statcard = () => {

    const { colors } = useTheme();
    const homeStyles = createHomeStyles(colors);

    const stats = [
    {
      emoji: '🔥',
      label: 'Your Streak',
      value: '5 Days',
      highlight: false,
    },
    {
      emoji: '⭐',
      label: 'Best Answer Streak',
      value: '2',
      highlight: false,
    },
    {
      emoji: '💰',
      label: 'Coins',
      value: '120',
      highlight: true,
    },
  ];

  return (
    <View style={homeStyles.statsSection}>
      <Text style={homeStyles.statsSectionTitle}>Your Stats 📈</Text>
      <View style={homeStyles.statsCard}>
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <View style={homeStyles.statItem}>
              <View style={homeStyles.statLeft}>
                <Text style={homeStyles.statEmoji}>{stat.emoji}</Text>
                <Text style={homeStyles.statLabel}>{stat.label}</Text>
              </View>
              <Text 
                style={[
                  homeStyles.statValue,
                  stat.highlight && homeStyles.statValueHighlight
                ]}
              >
                {stat.value}
              </Text>
            </View>
            {index < stats.length - 1 && (
              <View style={homeStyles.statDivider} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

export default Statcard