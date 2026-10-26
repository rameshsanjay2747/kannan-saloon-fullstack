from django.urls import path
from .views import (
    ServiceListView,
    CustomerServiceListCreateView,
    ServiceManagementListCreateView,
ServiceManagementDetailView,
)

urlpatterns = [
    path("services/", ServiceListView.as_view(), name="service-list"),
    path(
        "customer-services/",
        CustomerServiceListCreateView.as_view(),
        name="customer-service-list-create",
    ),
    path(
    "services/manage/",
    ServiceManagementListCreateView.as_view(),
    name="service-management-list",
),
path(
    "services/manage/<int:pk>/",
    ServiceManagementDetailView.as_view(),
    name="service-management-detail",
),
]