@include('partials/admin.settings.notice')

@section('settings::nav')
    @yield('settings::notice')

    {{-- Shared Settings Styles --}}
    <style>
        .settings-card {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            padding: 0;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: visible;
        }
        .settings-card-header {
            padding: 20px 28px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .settings-card-header .icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }
        .settings-card-header h3 {
            margin: 0;
            font-size: 17px;
            font-weight: 600;
            color: #f1f5f9;
            letter-spacing: 0.2px;
        }
        .settings-card-header p {
            margin: 2px 0 0 0;
            font-size: 13px;
            color: #64748b;
        }
        .settings-card-body {
            padding: 24px 28px;
        }
        .settings-field {
            margin-bottom: 22px;
        }
        .settings-field:last-child {
            margin-bottom: 0;
        }
        .settings-field label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #cbd5e1;
            margin-bottom: 8px;
            letter-spacing: 0.3px;
        }
        .settings-field .form-control,
        .settings-card .form-control {
            background: rgba(15, 23, 42, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 10px !important;
            color: #f1f5f9 !important;
            padding: 10px 14px !important;
            font-size: 14px !important;
            transition: all 0.2s ease !important;
            height: auto !important;
        }
        .settings-field .form-control:focus,
        .settings-card .form-control:focus {
            border-color: #6366f1 !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
            outline: none !important;
        }
        .settings-field select.form-control,
        .settings-card select.form-control {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 14px center !important;
            padding-right: 36px !important;
        }
        .settings-field .field-hint,
        .settings-card .field-hint {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
            line-height: 1.5;
        }
        .settings-toggle-group {
            display: flex;
            gap: 4px;
            background: rgba(15, 23, 42, 0.5);
            border-radius: 10px;
            padding: 4px;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .settings-toggle-group .btn {
            border: none !important;
            border-radius: 8px !important;
            padding: 8px 16px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #94a3b8 !important;
            background: transparent !important;
            transition: all 0.2s ease !important;
            box-shadow: none !important;
        }
        .settings-toggle-group .btn.active {
            background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
            color: #fff !important;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
        }
        .settings-toggle-group .btn:hover:not(.active) {
            background: rgba(255, 255, 255, 0.05) !important;
            color: #cbd5e1 !important;
        }
        .settings-file-upload {
            position: relative;
            border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(15, 23, 42, 0.4);
        }
        .settings-file-upload:hover {
            border-color: rgba(99, 102, 241, 0.4);
            background: rgba(99, 102, 241, 0.05);
        }
        .settings-file-upload input[type="file"] {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
            width: 100%;
            height: 100%;
        }
        .settings-file-upload .upload-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: rgba(99, 102, 241, 0.15);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            color: #a5b4fc;
            font-size: 18px;
        }
        .settings-file-upload .upload-text {
            font-size: 14px;
            font-weight: 500;
            color: #cbd5e1;
        }
        .settings-file-upload .upload-hint {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
        }
        .settings-save-btn {
            background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px 32px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #fff !important;
            letter-spacing: 0.3px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3) !important;
        }
        .settings-save-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4) !important;
        }
        .settings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .settings-grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }
        @media (max-width: 992px) {
            .settings-grid, .settings-grid-3 {
                grid-template-columns: 1fr;
            }
        }
    </style>

    <div class="row">
        <div class="col-xs-12">
            <div class="nav-tabs-custom nav-tabs-floating">
                <ul class="nav nav-tabs">
                    <li @if($activeTab === 'basic')class="active"@endif><a href="{{ route('admin.settings') }}">General</a></li>
                    <li @if($activeTab === 'mail')class="active"@endif><a href="{{ route('admin.settings.mail') }}">Mail</a></li>
                    <li @if($activeTab === 'advanced')class="active"@endif><a href="{{ route('admin.settings.advanced') }}">Advanced</a></li>
                    <li @if($activeTab === 'store')class="active"@endif><a href="{{ route('admin.settings.store') }}">Store</a></li>
                </ul>
            </div>
        </div>
    </div>
@endsection
