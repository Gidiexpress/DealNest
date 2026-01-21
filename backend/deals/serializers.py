from rest_framework import serializers
from .models import Deal, DealMessage, Dispute, DealSubmission
from core.models import JobType
from core.serializers import UserSerializer, PublicUserSerializer

class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
        fields = '__all__'

class DealSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealSubmission
        fields = ['id', 'links', 'files', 'notes', 'revision_round', 'created_at']

class DealMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = DealMessage
        fields = ['id', 'user', 'message', 'files', 'created_at']

class DealSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)  # Will be overridden dynamically or check context? 
    # Actually, we should use Public for both by default, and only show full details if 'me'?
    # Safer: Use PublicUserSerializer by default.
    client = PublicUserSerializer(read_only=True)
    freelancer = PublicUserSerializer(read_only=True)
    job_type_details = JobTypeSerializer(source='job_type', read_only=True)
    submissions = DealSubmissionSerializer(many=True, read_only=True)
    fee_breakdown = serializers.SerializerMethodField()
    job_type_id = serializers.PrimaryKeyRelatedField(
        queryset=JobType.objects.all(), source='job_type', write_only=True
    )
    
    class Meta:
        model = Deal
        fields = [
            'id', 'client', 'freelancer', 'job_type_details', 'job_type_id', 
            'title', 'description', 'amount', 'currency', 'status', 
            'milestones', 'dispute_window_expires', 'unique_shareable_url',
            'created_at', 'updated_at', 'attachments',
            'deadline', 'requirements', 'revision_count', 'submissions',
            'fee_breakdown'
        ]
        read_only_fields = ['status', 'unique_shareable_url', 'client', 'freelancer', 'dispute_window_expires']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['client'] = user
        return super().create(validated_data)

    def get_fee_breakdown(self, obj):
        from core.models import PlatformSettings
        settings = PlatformSettings.objects.first()
        if not settings:
            return None
        return settings.calculate_fee_breakdown(obj.amount)

class DisputeSerializer(serializers.ModelSerializer):
    opened_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Dispute
        fields = '__all__'
        read_only_fields = ['opened_by', 'admin_decision', 'decision_notes', 'resolved_at']
