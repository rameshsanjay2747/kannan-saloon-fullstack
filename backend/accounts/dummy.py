class parent:
    def __init__(self):
        self.public="public"
        self._protected="protected"
        self.__private="privated"
    def acessfromsameclass(self):
        print(self.public)
        print(self._protected)
        print(self.__private)
class son(parent):
    def acessfromanotherclass(self):
        print(self.public)
        print(self._protected)
        try:
            print(self.__private)
        except AttributeError:
            print("cannot acess")
        # print(self._parent__private)
class bro:
    def stranger(self,v):
        print(v.public)
        print(v._protected)
        try:
                    print(v.__private)
        except AttributeError:
                    print("cannot acess")

p=parent()
# p.acessfromsameclass()
s=son()
# s.acessfromsameclass()
s.acessfromanotherclass()
b=bro()
b.stranger(p)
