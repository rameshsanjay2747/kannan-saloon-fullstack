
# def rot(a,r,l):
#   for i in range(r):
#     rotate(a,l)
# def rotate(a,l):
#   t=a[0]
#   for i in range(l-1):
#     a[i]=a[i+1]
#   a[l-1]=t
# a=[1,2,3,4,5]
# r=2
# rot(a,r,len(a))
# print(a)
# def coun(a,l):
#     v=[False for i in range(l)]
#     for i in range(l):
#         if(v[i]==True):
#             continue
#         c=1
#         for j in range(i+1,l):
#             if(a[i]==a[j]):
#                 v[j]=True
#                 c=c+1
#         print(a[i],c)

# a=[10,30,10,20,10,20,30,10]
# l=len(a)
# coun(a,l)