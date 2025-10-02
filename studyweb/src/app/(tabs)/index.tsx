import { createHomeStyles } from "@/assets/styles/home.styles";
import Askcard from "@/components/Askcard";
import Header from "@/components/Header";
import PathSection from "@/components/PathSection";
import Statcard from "@/components/Statcard";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);

  const recentPosts = [
    {
      id: 1,
      title: 'How to solve quadratic equations?',
      description: 'I want to know why the answer is this? Can someone explain step by step?',
      category: 'Math',
      categoryEmoji: '📐',
      time: '5m ago',
      answers: 3,
    },
    {
      id: 2,
      title: 'Best way to learn React Native?',
      description: 'Looking for resources and tutorials for beginners.',
      category: 'Programming',
      categoryEmoji: '💻',
      time: '12m ago',
      answers: 7,
    },
    {
      id: 3,
      title: 'Photosynthesis process explanation',
      description: 'Need help understanding the light-dependent reactions.',
      category: 'Biology',
      categoryEmoji: '🧬',
      time: '1h ago',
      answers: 2,
    },
  ];

  return (
    <SafeAreaView style={homeStyles.safecontainer} edges={['left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeStyles.content}
      >
      <Header/>
      <Askcard/>
      <PathSection/>
      <View style={homeStyles.recentSection}>
        <View style={homeStyles.recentSectionHeader}>
          <Text style={homeStyles.recentSectionTitle}>Recent Questions 🕐</Text>
          <TouchableOpacity>
            <Text style={homeStyles.recentSectionViewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={homeStyles.recentCardsContainer}>
          {recentPosts.map((post) => (
            <TouchableOpacity 
              key={post.id}
              style={homeStyles.recentCard}
              activeOpacity={0.7}
            >
              <View style={homeStyles.recentCardTop}>
                <View style={homeStyles.recentCardLeft}>
                  <View style={homeStyles.recentCardCategory}>
                    <View style={homeStyles.recentCardCategoryBadge}>
                      <Text style={homeStyles.recentCardCategoryText}>
                        {post.categoryEmoji} {post.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={homeStyles.recentCardTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={homeStyles.recentCardDescription} numberOfLines={2}>
                    {post.description}
                  </Text>
                </View>
                <Text style={homeStyles.recentCardTime}>{post.time}</Text>
              </View>

              <View style={homeStyles.recentCardBottom}>
                <View style={homeStyles.recentCardStats}>
                  <View style={homeStyles.recentCardStat}>
                    <Ionicons name="chatbubble" size={13} color="#C9984E" />
                    <Text style={homeStyles.recentCardStatText}>{post.answers}</Text>
                  </View>
                </View>

                <View style={homeStyles.recentCardArrow}>
                  <Ionicons name="chevron-forward" size={16} color="#C9984E" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Statcard/>
      </ScrollView>
    </SafeAreaView>
  );
}