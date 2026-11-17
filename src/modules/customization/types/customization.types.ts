export interface CustomizationItem {
  id: string;
  userId: string | null;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OtherPrayerTypeItem extends CustomizationItem {
  requiresRakahCount: boolean;
}

export interface SkillItem {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillTopicItem {
  id: string;
  skillId: string;
  name: string;
  isPending: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntentionItem {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
