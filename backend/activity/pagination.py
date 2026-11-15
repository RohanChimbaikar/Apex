from rest_framework.pagination import PageNumberPagination


class ActivityLogPagination(PageNumberPagination):
    """
    Dedicated pagination class for the ActivityLog API.

    Using a dedicated class (instead of a global DEFAULT_PAGINATION_CLASS
    setting) ensures that existing Task and Visit endpoints retain their
    current, unpaginated behaviour.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
