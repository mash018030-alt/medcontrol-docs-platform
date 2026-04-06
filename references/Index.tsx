import { 
  Users, Building2, Stethoscope, FileText, BarChart3, 
  Monitor, Bell, HelpCircle, ChevronRight 
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface DocSection {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const sections: DocSection[] = [
  { icon: Stethoscope, title: "Осмотры", description: "Поиск, карточки, виды и серии осмотров, история прохождения", href: "#" },
  { icon: Building2, title: "Организации", description: "Карточка и настройки организации", href: "#" },
  { icon: Users, title: "Пользователи", description: "Карточка, создание и профиль пользователя", href: "#" },
  { icon: FileText, title: "Документы", description: "Управление документами", href: "#" },
  { icon: BarChart3, title: "Отчёты", description: "Формирование и действия с отчётами", href: "#" },
  { icon: Monitor, title: "ПАК", description: "Информация о программно-аппаратных комплексах", href: "#" },
  { icon: Bell, title: "Уведомления", description: "Подписки, шаблоны, уведомления в Telegram", href: "#" },
  { icon: HelpCircle, title: "Частые вопросы", description: "Ответы на популярные вопросы пользователей", href: "#" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Общее</h1>
        <p className="text-muted-foreground mb-8">Разделы документации по работе с системой</p>

        <div className="flex flex-col gap-2">
          {sections.map((section) => (
            <a
              key={section.title}
              href={section.href}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <section.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{section.title}</div>
                <div className="text-sm text-muted-foreground truncate">{section.description}</div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
