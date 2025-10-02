import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const PathSection = () => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  const paths = [
    { 
      emoji: '🔥', 
      title: 'Hot Questions',
      subtitle: 'Trending now'
    },
    { 
      emoji: '🕒', 
      title: 'Recent',
      subtitle: 'Latest posts'
    },
    { 
      emoji: '🏆', 
      title: 'Leaderboard',
      subtitle: 'Top contributors'
    },
    { 
      emoji: '🛒', 
      title: 'Store',
      subtitle: 'Redeem rewards'
    },
  ];

  return (
    <View style={homeStyles.pathSection}>
      <Text style={homeStyles.pathSectionTitle}>Quick Access</Text>
      
      <View style={homeStyles.pathGrid}>
        {paths.map((path, index) => (
          <TouchableOpacity 
            key={index}
            style={homeStyles.pathBtn}
            activeOpacity={0.7}
          >
            <View style={homeStyles.pathBtnContent}>
              <Text style={homeStyles.pathBtnEmoji}>{path.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={homeStyles.pathBtnText}>{path.title}</Text>
                <Text style={homeStyles.pathBtnSubtext}>{path.subtitle}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PathSection;