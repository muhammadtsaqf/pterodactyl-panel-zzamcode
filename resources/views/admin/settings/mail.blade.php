@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'mail'])

@section('title')
    Mail Settings
@endsection

@section('content-header')
    <h1>Mail Settings<small>Configure how Pterodactyl should handle sending emails.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    @if($disabled)
        <div class="settings-card">
            <div class="settings-card-body">
                <div class="alert alert-info no-margin-bottom">
                    This interface is limited to instances using SMTP as the mail driver. Please either use <code>php artisan p:environment:mail</code> command to update your email settings, or set <code>MAIL_DRIVER=smtp</code> in your environment file.
                </div>
            </div>
        </div>
    @else
        <form>
            {{-- SMTP Server Card --}}
            <div class="settings-card">
                <div class="settings-card-header">
                    <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2)); color: #93c5fd;">
                        <i class="fa fa-server"></i>
                    </div>
                    <div>
                        <h3>SMTP Server</h3>
                        <p>Configure your outgoing mail server connection</p>
                    </div>
                </div>
                <div class="settings-card-body">
                    <div class="settings-grid-3">
                        <div class="settings-field">
                            <label>SMTP Host</label>
                            <input required type="text" class="form-control" name="mail:mailers:smtp:host" value="{{ old('mail:mailers:smtp:host', config('mail.mailers.smtp.host')) }}" />
                            <div class="field-hint">Enter the SMTP server address.</div>
                        </div>
                        <div class="settings-field">
                            <label>SMTP Port</label>
                            <input required type="number" class="form-control" name="mail:mailers:smtp:port" value="{{ old('mail:mailers:smtp:port', config('mail.mailers.smtp.port')) }}" />
                            <div class="field-hint">Common ports: 25, 465, 587.</div>
                        </div>
                        <div class="settings-field">
                            <label>Encryption</label>
                            @php
                                $encryption = old('mail:mailers:smtp:encryption', config('mail.mailers.smtp.encryption'));
                            @endphp
                            <select name="mail:mailers:smtp:encryption" class="form-control">
                                <option value="" @if($encryption === '') selected @endif>None</option>
                                <option value="tls" @if($encryption === 'tls') selected @endif>TLS</option>
                                <option value="ssl" @if($encryption === 'ssl') selected @endif>SSL</option>
                            </select>
                            <div class="field-hint">Select the encryption type.</div>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <div class="settings-grid">
                            <div class="settings-field">
                                <label>Username</label>
                                <input type="text" class="form-control" name="mail:mailers:smtp:username" value="{{ old('mail:mailers:smtp:username', config('mail.mailers.smtp.username')) }}" />
                                <div class="field-hint">SMTP authentication username.</div>
                            </div>
                            <div class="settings-field">
                                <label>Password</label>
                                <input type="password" class="form-control" name="mail:mailers:smtp:password" />
                                <div class="field-hint">Leave blank to keep the existing password. Enter <code>!e</code> to clear.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Mail From Card --}}
            <div class="settings-card">
                <div class="settings-card-header">
                    <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.2)); color: #fdba74;">
                        <i class="fa fa-envelope"></i>
                    </div>
                    <div>
                        <h3>Sender Information</h3>
                        <p>Configure the "From" address and name for outgoing emails</p>
                    </div>
                </div>
                <div class="settings-card-body">
                    <div class="settings-grid">
                        <div class="settings-field">
                            <label>Mail From Address</label>
                            <input required type="email" class="form-control" name="mail:from:address" value="{{ old('mail:from:address', config('mail.from.address')) }}" />
                            <div class="field-hint">Email address all outgoing emails will originate from.</div>
                        </div>
                        <div class="settings-field">
                            <label>Mail From Name</label>
                            <input type="text" class="form-control" name="mail:from:name" value="{{ old('mail:from:name', config('mail.from.name')) }}" />
                            <div class="field-hint">The name emails should appear to come from.</div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Actions --}}
            <div style="display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 20px;">
                {{ csrf_field() }}
                <button type="button" id="testButton" class="settings-save-btn" style="background: linear-gradient(135deg, #22c55e, #16a34a) !important; box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3) !important;">
                    <i class="fa fa-flask" style="margin-right: 8px;"></i> Test
                </button>
                <button type="button" id="saveButton" class="settings-save-btn">
                    <i class="fa fa-check" style="margin-right: 8px;"></i> Save Changes
                </button>
            </div>
        </form>
    @endif
@endsection

@section('footer-scripts')
    @parent

    <script>
        function saveSettings() {
            return $.ajax({
                method: 'PATCH',
                url: '/admin/settings/mail',
                contentType: 'application/json',
                data: JSON.stringify({
                    'mail:mailers:smtp:host': $('input[name="mail:mailers:smtp:host"]').val(),
                    'mail:mailers:smtp:port': $('input[name="mail:mailers:smtp:port"]').val(),
                    'mail:mailers:smtp:encryption': $('select[name="mail:mailers:smtp:encryption"]').val(),
                    'mail:mailers:smtp:username': $('input[name="mail:mailers:smtp:username"]').val(),
                    'mail:mailers:smtp:password': $('input[name="mail:mailers:smtp:password"]').val(),
                    'mail:from:address': $('input[name="mail:from:address"]').val(),
                    'mail:from:name': $('input[name="mail:from:name"]').val()
                }),
                headers: { 'X-CSRF-Token': $('input[name="_token"]').val() }
            }).fail(function (jqXHR) {
                showErrorDialog(jqXHR, 'save');
            });
        }

        function testSettings() {
            swal({
                type: 'info',
                title: 'Test Mail Settings',
                text: 'Click "Test" to begin the test.',
                showCancelButton: true,
                confirmButtonText: 'Test',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    method: 'POST',
                    url: '/admin/settings/mail/test',
                    headers: { 'X-CSRF-TOKEN': $('input[name="_token"]').val() }
                }).fail(function (jqXHR) {
                    showErrorDialog(jqXHR, 'test');
                }).done(function () {
                    swal({
                        title: 'Success',
                        text: 'The test message was sent successfully.',
                        type: 'success'
                    });
                });
            });
        }

        function saveAndTestSettings() {
            saveSettings().done(testSettings);
        }

        function showErrorDialog(jqXHR, verb) {
            console.error(jqXHR);
            var errorText = '';
            if (!jqXHR.responseJSON) {
                errorText = jqXHR.responseText;
            } else if (jqXHR.responseJSON.error) {
                errorText = jqXHR.responseJSON.error;
            } else if (jqXHR.responseJSON.errors) {
                $.each(jqXHR.responseJSON.errors, function (i, v) {
                    if (v.detail) {
                        errorText += v.detail + ' ';
                    }
                });
            }

            swal({
                title: 'Whoops!',
                text: 'An error occurred while attempting to ' + verb + ' mail settings: ' + errorText,
                type: 'error'
            });
        }

        $(document).ready(function () {
            $('#testButton').on('click', saveAndTestSettings);
            $('#saveButton').on('click', function () {
                saveSettings().done(function () {
                    swal({
                        title: 'Success',
                        text: 'Mail settings have been updated successfully and the queue worker was restarted to apply these changes.',
                        type: 'success'
                    });
                });
            });
        });
    </script>
@endsection
