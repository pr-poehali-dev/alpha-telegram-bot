import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Request {
  id: string;
  clientName: string;
  phone: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed';
  timestamp: string;
}

interface AuditLog {
  id: string;
  action: string;
  admin: string;
  clientName: string;
  details: string;
  timestamp: string;
}

const Index = () => {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      clientName: 'Иванов Иван Иванович',
      phone: '+7 (999) 123-45-67',
      type: 'Блокировка карты',
      priority: 'high',
      status: 'pending',
      timestamp: '2026-01-17 14:32',
    },
    {
      id: '2',
      clientName: 'Петрова Мария Сергеевна',
      phone: '+7 (999) 234-56-78',
      type: 'Перевыпуск карты',
      priority: 'medium',
      status: 'processing',
      timestamp: '2026-01-17 14:15',
    },
    {
      id: '3',
      clientName: 'Сидоров Петр Александрович',
      phone: '+7 (999) 345-67-89',
      type: 'Блокировка приложения',
      priority: 'high',
      status: 'pending',
      timestamp: '2026-01-17 14:05',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      action: 'Блокировка карты',
      admin: 'Администратор #1',
      clientName: 'Козлов А.В.',
      details: 'Карта **** 1234 заблокирована по запросу клиента',
      timestamp: '2026-01-17 13:45',
    },
    {
      id: '2',
      action: 'Перевыпуск карты',
      admin: 'Администратор #2',
      clientName: 'Новикова Е.П.',
      details: 'Оформлен перевыпуск карты, срок доставки 5-7 дней',
      timestamp: '2026-01-17 13:20',
    },
    {
      id: '3',
      action: 'Блокировка приложения',
      admin: 'Администратор #1',
      clientName: 'Морозов Д.И.',
      details: 'Доступ к приложению заблокирован, код восстановления выслан на email',
      timestamp: '2026-01-17 12:55',
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const stats = {
    totalRequests: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    processing: requests.filter((r) => r.status === 'processing').length,
    completed: auditLogs.length,
    avgResponseTime: '3.2 мин',
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-secondary';
    }
  };

  const handleRequestAction = (requestId: string, newStatus: 'processing' | 'completed') => {
    setRequests(
      requests.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    if (newStatus === 'completed') {
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        setAuditLogs([
          {
            id: String(auditLogs.length + 1),
            action: request.type,
            admin: 'Администратор #1',
            clientName: request.clientName,
            details: `Заявка обработана: ${request.type}`,
            timestamp: new Date().toLocaleString('ru-RU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          ...auditLogs,
        ]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">А</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Альфа-Банк</h1>
                <p className="text-sm text-muted-foreground">Панель администратора колл-центра</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Icon name="User" size={14} className="mr-1" />
                Администратор #1
              </Badge>
              <Button variant="outline" size="icon">
                <Icon name="Bell" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего заявок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="ClipboardList" size={24} className="text-primary" />
                </div>
                <div className="text-3xl font-bold">{stats.totalRequests}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">В очереди</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Icon name="Clock" size={24} className="text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="RefreshCw" size={24} className="text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{stats.processing}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Завершено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="CheckCircle2" size={24} className="text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ср. время</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="Timer" size={24} className="text-primary" />
                </div>
                <div className="text-3xl font-bold">{stats.avgResponseTime}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="requests" className="gap-2">
              <Icon name="Inbox" size={16} />
              Очередь заявок
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <Icon name="Settings" size={16} />
              Операции
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Icon name="FileText" size={16} />
              Журнал аудита
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Icon name="BarChart3" size={16} />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Inbox" size={20} />
                  Входящие заявки
                </CardTitle>
                <CardDescription>Обработка запросов клиентов в реальном времени</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <Card key={request.id} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <Badge className={getPriorityColor(request.priority)}>
                                  {request.priority === 'high' && 'Высокий'}
                                  {request.priority === 'medium' && 'Средний'}
                                  {request.priority === 'low' && 'Низкий'}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(request.status)}>
                                  {request.status === 'pending' && 'Ожидает'}
                                  {request.status === 'processing' && 'В работе'}
                                  {request.status === 'completed' && 'Завершено'}
                                </Badge>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{request.clientName}</h3>
                                <p className="text-sm text-muted-foreground">{request.phone}</p>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Icon name="AlertCircle" size={16} className="text-primary" />
                                <span className="font-medium">{request.type}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Icon name="Clock" size={14} />
                                {request.timestamp}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {request.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestAction(request.id, 'processing')}
                                >
                                  <Icon name="Play" size={16} className="mr-2" />
                                  Взять в работу
                                </Button>
                              )}
                              {request.status === 'processing' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" onClick={() => setSelectedRequest(request)}>
                                      <Icon name="CheckCircle2" size={16} className="mr-2" />
                                      Завершить
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Завершение заявки</DialogTitle>
                                      <DialogDescription>
                                        Подтвердите выполнение операции для клиента {request.clientName}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Комментарий</Label>
                                        <Textarea placeholder="Добавьте детали выполненной операции..." />
                                      </div>
                                      <Button
                                        className="w-full"
                                        onClick={() => handleRequestAction(request.id, 'completed')}
                                      >
                                        Подтвердить завершение
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Icon name="ShieldOff" size={20} />
                    Блокировка карты
                  </CardTitle>
                  <CardDescription>Срочная блокировка банковской карты клиента</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Номер карты</Label>
                    <Input id="card-number" placeholder="**** **** **** 1234" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Телефон клиента</Label>
                    <Input id="client-phone" placeholder="+7 (999) 123-45-67" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Причина блокировки</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите причину" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">Утеря карты</SelectItem>
                        <SelectItem value="stolen">Кража карты</SelectItem>
                        <SelectItem value="fraud">Подозрение на мошенничество</SelectItem>
                        <SelectItem value="client">По запросу клиента</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" variant="destructive">
                    <Icon name="ShieldOff" size={16} className="mr-2" />
                    Заблокировать карту
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Icon name="Smartphone" size={20} />
                    Блокировка приложения
                  </CardTitle>
                  <CardDescription>Блокировка доступа к мобильному приложению</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-phone">Телефон клиента</Label>
                    <Input id="app-phone" placeholder="+7 (999) 123-45-67" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-reason">Причина блокировки</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите причину" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="device-lost">Утеря устройства</SelectItem>
                        <SelectItem value="suspicious">Подозрительная активность</SelectItem>
                        <SelectItem value="client">По запросу клиента</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email">Email для восстановления</Label>
                    <Input id="recovery-email" type="email" placeholder="client@example.com" />
                  </div>
                  <Button className="w-full" variant="destructive">
                    <Icon name="Smartphone" size={16} className="mr-2" />
                    Заблокировать приложение
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CreditCard" size={20} />
                    Перевыпуск карты
                  </CardTitle>
                  <CardDescription>Оформление перевыпуска банковской карты</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reissue-card">Старый номер карты</Label>
                    <Input id="reissue-card" placeholder="**** **** **** 1234" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reissue-phone">Телефон клиента</Label>
                    <Input id="reissue-phone" placeholder="+7 (999) 123-45-67" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-address">Адрес доставки</Label>
                    <Textarea id="delivery-address" placeholder="Укажите адрес доставки новой карты..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-type">Тип доставки</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип доставки" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Стандартная (5-7 дней)</SelectItem>
                        <SelectItem value="express">Экспресс (2-3 дня)</SelectItem>
                        <SelectItem value="branch">Самовывоз из отделения</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <Icon name="CreditCard" size={16} className="mr-2" />
                    Оформить перевыпуск
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="UserCog" size={20} />
                    Управление данными клиента
                  </CardTitle>
                  <CardDescription>Просмотр и редактирование информации о клиенте</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-client">Поиск клиента</Label>
                    <Input id="search-client" placeholder="Телефон или номер карты" />
                  </div>
                  <Button className="w-full" variant="outline">
                    <Icon name="Search" size={16} className="mr-2" />
                    Найти клиента
                  </Button>
                  <Separator />
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">
                      После поиска здесь отобразится информация о клиенте
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Журнал операций
                </CardTitle>
                <CardDescription>Полная история всех действий администраторов</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <Card key={log.id} className="border">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon name="FileCheck" size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{log.action}</h4>
                                <Badge variant="outline">{log.admin}</Badge>
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Клиент:</span> {log.clientName}
                              </p>
                              <p className="text-sm text-muted-foreground">{log.details}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Icon name="Clock" size={12} />
                                {log.timestamp}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Статистика по типам операций
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="ShieldOff" size={20} className="text-destructive" />
                        <span className="font-medium">Блокировка карт</span>
                      </div>
                      <Badge>45%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="CreditCard" size={20} className="text-primary" />
                        <span className="font-medium">Перевыпуск карт</span>
                      </div>
                      <Badge>30%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="Smartphone" size={20} className="text-blue-600" />
                        <span className="font-medium">Блокировка приложений</span>
                      </div>
                      <Badge>25%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Users" size={20} />
                    Активность администраторов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                          А1
                        </div>
                        <span className="font-medium">Администратор #1</span>
                      </div>
                      <Badge variant="outline">28 заявок</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                          А2
                        </div>
                        <span className="font-medium">Администратор #2</span>
                      </div>
                      <Badge variant="outline">22 заявки</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                          А3
                        </div>
                        <span className="font-medium">Администратор #3</span>
                      </div>
                      <Badge variant="outline">19 заявок</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Activity" size={20} />
                    Динамика обработки заявок
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center space-y-2">
                      <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        График динамики обработки заявок за последние 7 дней
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
